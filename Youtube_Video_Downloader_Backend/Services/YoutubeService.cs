namespace YouVid.io___Youtube_Video_Downloader.Services
{
    using Serilog;
    using YoutubeExplode;
    using YoutubeExplode.Videos;
    using YoutubeExplode.Videos.Streams;
    using YouVid.io___Youtube_Video_Downloader.Models;

    public class YoutubeService
    {

        private readonly YoutubeClient _youtubeClient;
        string tempDir = Path.GetTempPath();
        public YoutubeService()
        {
            _youtubeClient = new YoutubeClient();
        }

        public async Task<VideoResponse> DownloadVideoDataAsync(
            VideoDownloadSettings settings,
            VideoDownloadPreference preference,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Parse the video ID from the URL
                VideoId videoId = VideoId.Parse(settings.Url!);

                // Retrieve the stream manifest
                ValueTask<StreamManifest> streamManifest = _youtubeClient.Videos.Streams.GetManifestAsync(videoId.ToString(), cancellationToken);
                Task<VideoInfo> videoMetadata = GetVideoInfoAsync(settings.Url!);

                await Task.WhenAll(streamManifest.AsTask(), videoMetadata);

                // Attempt to select the best muxed stream
                MuxedStreamInfo? bestMuxedStream = streamManifest.Result.GetMuxedStreams()
                    .OrderByDescending(s => s.VideoQuality.MaxHeight)
                    .ThenByDescending(s => s.Bitrate)
                    .ThenBy(s => s.Size)
                    .FirstOrDefault();

                VideoResponse response = new VideoResponse()
                {
                    VideoTitle = videoMetadata.Result.Title + ".mp4",
                };
                if (bestMuxedStream != null)
                {
                    await _youtubeClient.Videos.Streams.CopyToAsync(bestMuxedStream, response.VideoStream);
                    response.VideoStream.Position = 0; // Reset the stream position for reading
                    return response;
                }

                // If no muxed stream, fallback to separate video and audio streams
                IVideoStreamInfo? bestVideoStream = streamManifest.Result.GetVideoStreams()
                    .Where(s => s.VideoQuality.MaxHeight <= 1440) // Filter streams to a maximum of 2K (1440p)
                    .OrderByDescending(s => s.VideoQuality.MaxHeight)
                    .ThenBy(s => s.Size)
                    .FirstOrDefault();
                IAudioStreamInfo? bestAudioStream = streamManifest.Result.GetAudioStreams()
                    .OrderByDescending(s => s.Bitrate)
                    .ThenBy(s => s.Size)
                    .FirstOrDefault();

                if (bestVideoStream == null || bestAudioStream == null)
                    throw new InvalidOperationException("No suitable video or audio streams found.");

                // Create temporary memory streams
                MemoryStream videoStream = new MemoryStream();
                MemoryStream audioStream = new MemoryStream();

                await Task.WhenAll(
                    _youtubeClient.Videos.Streams.CopyToAsync(bestVideoStream, videoStream).AsTask(),
                    _youtubeClient.Videos.Streams.CopyToAsync(bestAudioStream, audioStream).AsTask()
                );

                videoStream.Position = 0;
                audioStream.Position = 0;

                // Combine video and audio using FFmpeg 
                await CombineVideoAndAudio(videoStream, audioStream, response.VideoStream, cancellationToken);

                switch (settings.Settings)
                {
                    case ProcessSettings.Normal:
                        break;
                    case ProcessSettings.High:
                        string toEnhanceVideoFile = Path.Combine(tempDir, Path.GetTempFileName() + ".mp4");
                        response.VideoStream.Position = 0;
                        await WriteStreamToFileAsync(response.VideoStream, toEnhanceVideoFile, cancellationToken);
                        await EnhanceHigh(toEnhanceVideoFile, response.VideoStream, cancellationToken);
                        break;
                    default:
                        throw new Exception("Invalid video setting given");
                }

                response.VideoStream.Position = 0;

                return response;
            }
            catch (Xabe.FFmpeg.Exceptions.ConversionException ffmpegEx)
            {
                throw new InvalidOperationException($"FFmpeg failed to process the video: {ffmpegEx.Message}", ffmpegEx);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to download video: {ex.Message}", ex);
            }
        }

        public async Task<VideoInfo> GetVideoInfoAsync(string url)
        {
            try
            {
                Video video = await _youtubeClient.Videos.GetAsync(url);
                Log.Information("Video Info retrieved..");
                return new VideoInfo
                {
                    Title = video.Title ?? "video.mp4",
                    Url = url
                };
            }
            catch (Exception ex)
            {
                Log.Error($"Error fetching video info: {ex.Message}");
                return new VideoInfo
                {
                    Title = "video.mp4",
                    Url = url
                };
            }
        }
        private async Task CombineVideoAndAudio(Stream videoStream, Stream audioStream, Stream outputStream, CancellationToken cancellationToken)
        {
            string tempVideoFile = Path.Combine(tempDir, Path.GetTempFileName() + ".mp4");
            string tempAudioFile = Path.Combine(tempDir, Path.GetTempFileName() + ".aac");
            string outputFile = Path.Combine(tempDir, Path.GetTempFileName() + ".mp4");

            try
            {
                // Save streams to temporary files
                await File.WriteAllBytesAsync(tempVideoFile, ((MemoryStream)videoStream).ToArray(), cancellationToken);
                await File.WriteAllBytesAsync(tempAudioFile, ((MemoryStream)audioStream).ToArray(), cancellationToken);

                Xabe.FFmpeg.IConversion ffmpeg = Xabe.FFmpeg.FFmpeg.Conversions.New()
                .AddParameter($"-i \"{tempVideoFile}\"") // Video input
                .AddParameter($"-i \"{tempAudioFile}\"") // Audio input
                .AddParameter("-c:v copy") // Copy video codec
                .AddParameter("-c:a aac") // Use AAC codec for audio
                .AddParameter("-strict experimental") // Allow experimental codecs
                .AddParameter("-f mp4") // Ensure output format is mp4
                .AddParameter($"\"{outputFile}\""); // Output file

                Log.Information("Combining video and audio..");
                await ffmpeg.Start(cancellationToken);

                // Return combined file as a memory stream
                outputStream.Position = 0;
                outputStream.SetLength(0);
                outputStream.Write((await File.ReadAllBytesAsync(outputFile, cancellationToken)));
            }
            finally
            {
                // Clean up temporary files
                File.Delete(tempVideoFile);
                File.Delete(tempAudioFile);
                File.Delete(outputFile);
            }
        }

        private async Task EnhanceHigh(string inputFile, Stream toWriteStream, CancellationToken cancellationToken)
        {
            string outputFile = Path.Combine(tempDir, Path.GetTempFileName() + ".mp4");
            try
            {
                Log.Information($"Enhancing video to high...");

                // Enhance quality and optimize for speed without hindering quality
                Xabe.FFmpeg.IConversion ffmpeg = Xabe.FFmpeg.FFmpeg.Conversions.New()
                  .AddParameter($"-i \"{inputFile}\"") // Video input
                  .AddParameter("-vcodec libx264") // Use libx264 codec for video
                  .AddParameter("-preset fast") // Use fast preset for NVENC
                  .AddParameter("-b:v 4M") // Set bitrate for reasonable quality-speed balance
                  .AddParameter("-crf 28") // Slightly increase CRF for faster encoding
                  .AddParameter("-preset ultrafast") // Use a faster preset for reduced latency
                  .AddParameter("-tune zerolatency") // Optimize for low latency
                  .AddParameter("-threads 0") // Use all available threads
                  .AddParameter("-bf 2") // Limit B-frames to 2 for faster encoding
                  .AddParameter("-g 48") // Set GOP size
                  .AddParameter("-level 4.1") // Ensure compatibility
                  .AddParameter($"-f mp4") // Output format
                  .AddParameter($"\"{outputFile}\""); // Output file




                await ffmpeg.Start(cancellationToken);

                // Return combined file as a memory stream
                toWriteStream.Position = 0;
                toWriteStream.SetLength(0);
                toWriteStream.Write((await File.ReadAllBytesAsync(outputFile, cancellationToken)));

                Log.Information($"Video optimized successfully...");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during optimization: {ex.Message}");
            }
            finally
            {
                // Clean up temporary files
                File.Delete(inputFile);
                File.Delete(outputFile);
            }
        }

        private async Task WriteStreamToFileAsync(Stream stream, string filePath, CancellationToken cancellationToken = default)
        {
            using (FileStream fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
            {
                await stream.CopyToAsync(fileStream, cancellationToken);
            }
        }
    }
}