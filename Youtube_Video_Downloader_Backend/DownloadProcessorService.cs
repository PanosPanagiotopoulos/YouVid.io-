csharp
namespace YouVid.io___Youtube_Video_Downloader.Services
{
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;
    using Serilog;
    using System.Threading;
 using Youtube_Video_Downloader_Backend.Models;
    using System.Threading.Tasks;

    public class DownloadProcessorService : BackgroundService
    {
        private readonly DownloadQueue _downloadQueue;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly ILogger<DownloadProcessorService> _logger;

        public DownloadProcessorService(DownloadQueue downloadQueue, IServiceScopeFactory serviceScopeFactory, ILogger<DownloadProcessorService> logger)
        {
            _downloadQueue = downloadQueue;
            _serviceScopeFactory = serviceScopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Download Processor Service started.");
            while (!stoppingToken.IsCancellationRequested)
            {
                var nextItem = await _downloadQueue.DequeueAsync(stoppingToken);
                if (nextItem != null)
                {
                    _logger.LogInformation($"Processing download for video: {nextItem.VideoId}");
                    _downloadQueue.UpdateVideoStatus(nextItem.Id, "downloading");
                    try
                    {
                        using (var scope = _serviceScopeFactory.CreateScope())
                        {
                            var youtubeService = scope.ServiceProvider.GetRequiredService<YoutubeService>();
                            // Implement the actual download logic here
                            // This will likely involve calling the YoutubeService to download the video
                            // and saving it to a temporary location or streaming it.
                            // For now, let's simulate a download.
                            VideoDownloadSettings videoSettings = new() { Url = nextItem.VideoId, Settings = ProcessSettings.Normal };
                            VideoDownloadPreference videoPreference = new() { SelectedFormat = nextItem.Format, SelectedQuality = nextItem.Quality};
                            
                            var video = await youtubeService.DownloadVideoDataAsync(videoSettings, videoPreference, stoppingToken);

                            // Assuming download is successful
                            _downloadQueue.UpdateVideoStatus(nextItem.Id, "finished");
                            _logger.LogInformation($"Finished downloading video: {nextItem.VideoId}");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error downloading video {nextItem.VideoId}");
                        _downloadQueue.UpdateVideoStatus(nextItem.Id, "error", ex.Message);
                    }
                }
            }
            _logger.LogInformation("Download Processor Service stopped.");
        }
    }
}