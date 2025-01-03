using Microsoft.AspNetCore.Mvc;
using Serilog;
using YoutubeExplode.Videos.Streams;
using YouVid.io___Youtube_Video_Downloader.Models;
using YouVid.io___Youtube_Video_Downloader.Services;

namespace YouVid.io___Youtube_Video_Downloader.Controllers
{
    [ApiController]
    [Route("api/video")]
    public class VideoProcessController : ControllerBase
    {
        private readonly YoutubeService _youtubeService;

        public VideoProcessController(YoutubeService youtubeService2)
        {
            _youtubeService = youtubeService2;
        }

        [HttpGet("download")]
        public async Task<IActionResult> DownloadVideo([FromQuery] VideoDownloadSettings videoDownloadSettings)
        {
            if (!ModelState.IsValid)
            {
                Log.Error("Faulty Model State Data");
                return BadRequest(ModelState);
            }

            if (string.IsNullOrEmpty(videoDownloadSettings.Url) || string.IsNullOrWhiteSpace(videoDownloadSettings.Url.Trim()))
            {
                Log.Error("Not Valid URL sent to download");
                ModelState.AddModelError("error", "Not Valid URL sent to download");
                return BadRequest(ModelState);
            }

            if (videoDownloadSettings.Settings == default(ProcessSettings))
            {
                Log.Error("Not Process settings to process");
                ModelState.AddModelError("error", "Not Valid Process Setting sent to process");
                return BadRequest(ModelState);
            }

            try
            {
                // Create a VideoDownloadPreference object
                Container preferredContainer = Container.Mp4; // Choose MP4 as the preferred container
                VideoQualityPreference preferredQuality = VideoQualityPreference.Highest; // Choose up to 1080p quality

                VideoDownloadPreference videoDownloadPreference = new VideoDownloadPreference(preferredContainer, preferredQuality);
                // Process and retrieve video response
                VideoResponse result = await _youtubeService.DownloadVideoDataAsync
                    (
                        videoDownloadSettings,
                        videoDownloadPreference
                    );

                Log.Information($"Serving video: {result.VideoTitle}");

                string sanitizedVideoTitle = string.Concat(result.VideoTitle.Where(c => c <= 127 && c != '"' && c != '\\'));
                // Set the Content-Disposition header to indicate the file name in the browser
                Response.Headers.Append("Accept-Ranges", "bytes");
                Response.Headers.Append("Cache-Control", "no-store");
                if (!Response.Headers.ContainsKey("Content-Disposition"))
                {
                    Response.Headers.Append("Content-Disposition", $"attachment; filename=\"{sanitizedVideoTitle}\"");
                }

                else Response.Headers["Content-Disposition"] = $"attachment; filename=\"{sanitizedVideoTitle}\"";


                // Ensure the stream is at the beginning
                result.VideoStream.Seek(0, SeekOrigin.Begin);

                return File(result.VideoStream, result.MimeType!, enableRangeProcessing: true);
            }
            catch (InvalidOperationException ioe)
            {
                Log.Error(ioe, $"An error occurred while processing the video: {ioe.Message}");
                ModelState.AddModelError("error", ioe.Message);
                return NotFound(ModelState);
            }
            catch (IOException ioex)
            {
                Log.Error(ioex, $"An IO error occurred while downloading the video: {ioex.Message}");
                // Do not return BadRequest for IO exceptions, just log the error
                ModelState.AddModelError("error", "An error occurred while processing the video.");
                return BadRequest(ModelState);
            }
            catch (Exception ex)
            {
                Log.Error(ex, $"An error occurred while downloading the video: {ex.Message}");
                ModelState.AddModelError("error", ex.Message);
                return BadRequest(ModelState);
            }
        }
    }
}
