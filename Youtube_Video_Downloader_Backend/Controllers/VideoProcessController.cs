using Microsoft.AspNetCore.Mvc;
using Serilog;
using YoutubeExplode.Videos.Streams;
using YouVid.io___Youtube_Video_Downloader.Models;
using YouVid.io___Youtube_Video_Downloader;

namespace YouVid.io___Youtube_Video_Downloader.Controllers
{
    [ApiController]
    [Route("api/video")]
    public class VideoProcessController : ControllerBase

    {
        private readonly YoutubeService _youtubeService;
        private readonly VideoQueue _videoQueue;

        public VideoProcessController(YoutubeService youtubeService2, VideoQueue videoQueue)
        {
            _youtubeService = youtubeService2;
            _videoQueue = videoQueue;
        }

        [HttpGet("download")]
        public IActionResult DownloadVideo([FromQuery] string videoId, [FromQuery] string? format = null, [FromQuery] string? quality = null)
        {
            // Add the video to the queue
            var videoQueueItem = new VideoQueueItem(videoId, format ?? "mp4", quality ?? "highres");
            _videoQueue.AddVideoToQueue(videoQueueItem);

            // Return the queue item ID and initial status
            return Ok(new { id = videoQueueItem.Id, status = videoQueueItem.Status });
        }

        [HttpGet("chunk")]
        public async Task<IActionResult> GetVideoChunk([FromQuery] string videoId, [FromQuery] long offset, [FromQuery] int length, [FromQuery] string? quality = null, [FromQuery] string? format = null)
        {
            try
            {
                // In a real application, you would retrieve the video stream based on videoId and quality.
                // For this example, we'll simulate retrieving a chunk from a dummy stream.
                // You would also need to implement caching logic here.

                // This is a placeholder for actual video chunk retrieval logic
                // You would likely have a service that manages video streams and chunks
                var videoStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes("This is a simulated video chunk for video ID: " + videoId));

                // Seek to the correct offset
                videoStream.Seek(offset, SeekOrigin.Begin);

                // Read the specified length
                byte[] chunk = new byte[length];
                videoStream.Read(chunk, 0, length);

                return File(chunk, "application/octet-stream", enableRangeProcessing: false);
            }
            catch (Exception ex)
            {
                Log.Error(ex, $"An error occurred while getting video chunk: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("queue")]
        public IActionResult GetQueueStatus()
        {
            return Ok(_videoQueue.GetAllVideosInQueue());
        }

        [HttpGet("queue/{id}")]
        public IActionResult GetVideoQueueStatus(Guid id)
        {
            var status = _videoQueue.GetVideoStatus(id);
            if (status == null) return NotFound("Video not found in queue.");
            return Ok(new { id, status });
        }

        // This method is added to allow setting the in-memory cache from outside
    }
}
