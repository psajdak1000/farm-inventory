using InwentarzWGospodarstwie.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace InwentarzWGospodarstwie.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController : ControllerBase
{
    private readonly IHuggingFaceService _huggingFaceService;

    public AiController(IHuggingFaceService huggingFaceService)
    {
        _huggingFaceService = huggingFaceService;
    }

    [Authorize]
    [HttpPost("chat")]
    public async Task<ActionResult<AiChatResponse>> Chat([FromBody] AiChatRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new AiChatErrorResponse("Message must not be empty."));
        }

        var result = await _huggingFaceService.GetChatCompletionAsync(request.Message, cancellationToken);
        if (!result.Success)
        {
            var statusCode = result.StatusCode ?? StatusCodes.Status502BadGateway;
            return StatusCode(statusCode, new AiChatErrorResponse(result.ErrorMessage ?? "Hugging Face API error."));
        }

        return Ok(new AiChatResponse(result.Answer ?? string.Empty));
    }
}

public sealed class AiChatRequest
{
    [Required(ErrorMessage = "Message is required.")]
    [StringLength(2000, ErrorMessage = "Message must not exceed 2000 characters.")]
    public string Message { get; set; } = string.Empty;
}

public record AiChatResponse(string Answer);
public record AiChatErrorResponse(string Error);
