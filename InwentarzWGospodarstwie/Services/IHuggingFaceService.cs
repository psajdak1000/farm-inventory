using System.Threading;
using System.Threading.Tasks;

namespace InwentarzWGospodarstwie.Services;

public interface IHuggingFaceService
{
    Task<HuggingFaceResult> GetChatCompletionAsync(string message, CancellationToken cancellationToken = default);
}

public record HuggingFaceResult(bool Success, string? Answer, string? ErrorMessage, int? StatusCode)
{
    public static HuggingFaceResult Ok(string answer) => new(true, answer, null, null);
    public static HuggingFaceResult Fail(string errorMessage, int? statusCode = null) => new(false, null, errorMessage, statusCode);
}
