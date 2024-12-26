using Microsoft.AspNetCore.Mvc;
using Serilog;
using YouVid.io___Youtube_Video_Downloader.Services;

namespace YouVid.io___Youtube_Video_Downloader.Controllers
{
    [ApiController]
    [Route("api/video")]
    public class VideoProcessController : ControllerBase
    {
        private readonly VideoProcessingService _youtubeService;

        public VideoProcessController(VideoProcessingService youtubeService)
        {
            _youtubeService = youtubeService;
        }

        /// <summary>
        /// Downloads a video from the specified URL.
        /// </summary>
        /// <param name="url">The URL of the video to download.</param>
        /// <returns>The downloaded video file.</returns>
        [HttpGet("download")]
        public async Task<IActionResult> DownloadVideo([FromQuery] string? url)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (string.IsNullOrEmpty(url) || string.IsNullOrWhiteSpace(url.Trim()))
            {
                ModelState.AddModelError("error", "Not Valid URL sent to download");
                return BadRequest(ModelState);
            }

            try
            {
                // Get the video ID from the URL
                string videoId = _youtubeService.GetYoutubeVideoIdFromUrl(url);

                // Get the video stream and original title
                (Stream videoStream, string videoTitle) = await _youtubeService.Get(videoId);

                // Return the video file with the original title
                return File(videoStream, "video/mp4", $"{videoTitle}-enhanced.mp4");
            }
            catch (Exception ex)
            {
                // Log the error
                Log.Error(ex, $"An error occurred while downloading the video: {ex.Message}");

                // Add the error message to the model state
                ModelState.AddModelError("error", ex.Message);

                // Return the error message
                return BadRequest(ModelState);
            }
        }
    }
}