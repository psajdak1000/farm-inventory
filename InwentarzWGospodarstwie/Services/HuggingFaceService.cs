using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace InwentarzWGospodarstwie.Services;

public class HuggingFaceService : IHuggingFaceService
{
    private const string ChatCompletionsUrl = "https://router.huggingface.co/v1/chat/completions";
    private const string DefaultModel = "katanemo/Arch-Router-1.5B:hf-inference";
    private const string SystemPrompt = "Jestes pomocnym asystentem w aplikacji do zarzadzania inwentarzem w gospodarstwie. Odpowiadaj krotko i po polsku.";
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public HuggingFaceService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
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
            token = Environment.GetEnvironmentVariable("HF_TOKEN");
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            return HuggingFaceResult.Fail(
                "Hugging Face API token is not configured. Set HUGGINGFACE_API_TOKEN or HF_TOKEN.",
                StatusCodes.Status500InternalServerError);
        }

        var model = _configuration["HuggingFace:Model"];
        if (string.IsNullOrWhiteSpace(model))
        {
            model = Environment.GetEnvironmentVariable("HUGGINGFACE_MODEL");
        }

        if (string.IsNullOrWhiteSpace(model))
        {
            model = DefaultModel;
        }

        var request = new HttpRequestMessage(HttpMethod.Post, ChatCompletionsUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(new
        {
            model,
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content = SystemPrompt
                },
                new
                {
                    role = "user",
                    content = message
                }
            },
            max_tokens = 250,
            temperature = 0.7
        });

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.SendAsync(request, cancellationToken);
        }
        catch (HttpRequestException)
        {
            return HuggingFaceResult.Fail(
                "Failed to reach Hugging Face API service.",
                StatusCodes.Status502BadGateway);
        }
        catch (TaskCanceledException)
        {
            return HuggingFaceResult.Fail(
                "Request to Hugging Face API timed out.",
                StatusCodes.Status504GatewayTimeout);
        }

        var content = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var upstreamStatusCode = (int)response.StatusCode;
            var errorMessage = MapErrorMessage(upstreamStatusCode, content);
            var mappedStatusCode = MapStatusCodeForClient(upstreamStatusCode);
            return HuggingFaceResult.Fail(errorMessage, mappedStatusCode);
        }

        var answer = ExtractAssistantMessage(content);
        if (string.IsNullOrWhiteSpace(answer))
        {
            return HuggingFaceResult.Fail(
                "Hugging Face API returned an unexpected chat response.",
                StatusCodes.Status502BadGateway);
        }

        return HuggingFaceResult.Ok(answer);
    }

    private static string MapErrorMessage(int statusCode, string content)
    {
        return statusCode switch
        {
            StatusCodes.Status401Unauthorized or StatusCodes.Status403Forbidden
                => "Problem z autoryzacja zewnetrznego API Hugging Face. Sprawdz token API.",
            StatusCodes.Status404NotFound
                => "Hugging Face endpoint or model was not found. Verify the selected model and router URL.",
            StatusCodes.Status429TooManyRequests
                => "Hugging Face request limit was exceeded. Please try again later.",
            StatusCodes.Status502BadGateway or StatusCodes.Status503ServiceUnavailable or StatusCodes.Status504GatewayTimeout
                => "Hugging Face service is temporarily unavailable. Please try again later.",
            _ => $"Hugging Face API error: {ExtractErrorMessage(content)}"
        };
    }

    private static int MapStatusCodeForClient(int statusCode)
    {
        return statusCode switch
        {
            StatusCodes.Status401Unauthorized or StatusCodes.Status403Forbidden => StatusCodes.Status502BadGateway,
            _ => statusCode
        };
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

            if (root.ValueKind == JsonValueKind.Object)
            {
                if (root.TryGetProperty("error", out var error))
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

                if (root.TryGetProperty("message", out var topLevelMessage))
                {
                    return SanitizeErrorMessage(topLevelMessage.GetString(), fallback);
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

    private static string? ExtractAssistantMessage(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return null;
        }

        try
        {
            using var doc = JsonDocument.Parse(content);
            var root = doc.RootElement;

            if (root.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            if (!root.TryGetProperty("choices", out var choices) ||
                choices.ValueKind != JsonValueKind.Array ||
                choices.GetArrayLength() == 0)
            {
                return null;
            }

            var firstChoice = choices[0];
            if (firstChoice.ValueKind != JsonValueKind.Object ||
                !firstChoice.TryGetProperty("message", out var message) ||
                message.ValueKind != JsonValueKind.Object ||
                !message.TryGetProperty("content", out var assistantContent))
            {
                return null;
            }

            return assistantContent.GetString();
        }
        catch (JsonException)
        {
            return null;
        }

    }
}
