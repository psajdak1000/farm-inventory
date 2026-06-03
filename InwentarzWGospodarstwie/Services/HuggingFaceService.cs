using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace InwentarzWGospodarstwie.Services;

public class HuggingFaceService : IHuggingFaceService
{
    private const string DefaultModel = "gpt2";
    private readonly HttpClient _httpClient;

    public HuggingFaceService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<HuggingFaceResult> GetChatCompletionAsync(string message, CancellationToken cancellationToken = default)
    {
        var mockMode = Environment.GetEnvironmentVariable("AI_MOCK_MODE");
        if (string.Equals(mockMode, "true", StringComparison.OrdinalIgnoreCase))
        {
            return HuggingFaceResult.Ok($"Demo AI response: received message: {message}");
        }

        var token = Environment.GetEnvironmentVariable("HUGGINGFACE_API_TOKEN");
        if (string.IsNullOrWhiteSpace(token))
        {
            return HuggingFaceResult.Fail(
                "Hugging Face API token is not configured. Set HUGGINGFACE_API_TOKEN.",
                StatusCodes.Status500InternalServerError);
        }

        var model = Environment.GetEnvironmentVariable("HUGGINGFACE_MODEL");
        if (string.IsNullOrWhiteSpace(model))
        {
            model = DefaultModel;
        }

        var request = new HttpRequestMessage(HttpMethod.Post, $"https://api-inference.huggingface.co/models/{model}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(new
        {
            inputs = message,
            parameters = new { max_new_tokens = 200 }
        });

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.SendAsync(request, cancellationToken);
        }
        catch (HttpRequestException)
        {
            return HuggingFaceResult.Fail("Failed to reach Hugging Face API.", StatusCodes.Status502BadGateway);
        }
        catch (TaskCanceledException)
        {
            return HuggingFaceResult.Fail("Request to Hugging Face API timed out.", StatusCodes.Status504GatewayTimeout);
        }

        var content = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorMessage = ExtractErrorMessage(content);
            return HuggingFaceResult.Fail($"Hugging Face API error: {errorMessage}", (int)response.StatusCode);
        }

        var answer = ExtractGeneratedText(content);
        if (string.IsNullOrWhiteSpace(answer))
        {
            return HuggingFaceResult.Fail(
                "Hugging Face API returned an unexpected response.",
                StatusCodes.Status502BadGateway);
        }

        return HuggingFaceResult.Ok(answer);
    }

    private static string ExtractErrorMessage(string content)
    {
        const string fallback = "Hugging Face API returned an error.";

        if (string.IsNullOrWhiteSpace(content))
        {
            return fallback;
        }

        try
        {
            using var doc = JsonDocument.Parse(content);
            var root = doc.RootElement;

            if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("error", out var error))
            {
                if (error.ValueKind == JsonValueKind.String)
                {
                    return SanitizeErrorMessage(error.GetString(), fallback);
                }

                if (error.ValueKind == JsonValueKind.Object && error.TryGetProperty("message", out var message))
                {
                    return SanitizeErrorMessage(message.GetString(), fallback);
                }
            }
        }
        catch (JsonException)
        {
        }

        return fallback;
    }

    private static string SanitizeErrorMessage(string? message, string fallback)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return fallback;
        }

        var trimmed = message.Trim();
        return trimmed.Length > 200 ? trimmed.Substring(0, 200) : trimmed;
    }

    private static string? ExtractGeneratedText(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return null;
        }

        try
        {
            using var doc = JsonDocument.Parse(content);
            var root = doc.RootElement;

            if (root.ValueKind == JsonValueKind.Array && root.GetArrayLength() > 0)
            {
                var first = root[0];
                if (first.ValueKind == JsonValueKind.Object && first.TryGetProperty("generated_text", out var generated))
                {
                    return generated.GetString();
                }
            }

            if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("generated_text", out var generatedText))
            {
                return generatedText.GetString();
            }
        }
        catch (JsonException)
        {
            return null;
        }

        return null;
    }
}
