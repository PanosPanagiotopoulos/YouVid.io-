using Serilog;
using System.Text.RegularExpressions;
using Xabe.FFmpeg;
using YoutubeExplode;
using YoutubeExplode.Videos;
using YoutubeExplode.Videos.Streams;

namespace YouVid.io___Youtube_Video_Downloader.Services
{
    public class VideoProcessingService
    {
        private readonly YoutubeClient _youtubeClient;

        public VideoProcessingService()
        {
            _youtubeClient = new YoutubeClient();
        }

        public async Task<(Stream, string)> Get(string videoId)
        {
            // Fetch the video information
            Video video = await _youtubeClient.Videos.GetAsync(videoId);

            // Fetch the stream manifest for the video
            StreamManifest streamManifest = await _youtubeClient.Videos.Streams.GetManifestAsync(videoId);

            if (streamManifest == null)
            {
                throw new Exception("Failed to fetch stream manifest. The video might be restricted or unavailable.");
            }

            // Attempt to get the best video and audio streams
            IStreamInfo videoStream = streamManifest.GetVideoOnlyStreams().GetWithHighestBitrate();
            IStreamInfo audioStream = streamManifest.GetAudioOnlyStreams().GetWithHighestBitrate();

            if (videoStream == null || audioStream == null)
            {
                throw new Exception("No suitable video or audio streams found for the video.");
            }

            // Create unique temporary file names based on video ID and current timestamp
            string timestamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
            string tempVideoFilePath = Path.Combine(Path.GetTempPath(), $"{videoId}_video_{timestamp}.tmp");
            string tempAudioFilePath = Path.Combine(Path.GetTempPath(), $"{videoId}_audio_{timestamp}.tmp");
            string tempOutputFilePath = Path.Combine(Path.GetTempPath(), $"{videoId}_output_{timestamp}.mp4");

            try
            {
                // Download the video and audio streams to temporary files
                await _youtubeClient.Videos.Streams.DownloadAsync(videoStream, tempVideoFilePath);
                await _youtubeClient.Videos.Streams.DownloadAsync(audioStream, tempAudioFilePath);

                // Create MediaInfo objects from the downloaded files
                IMediaInfo videoInput = await FFmpeg.GetMediaInfo(tempVideoFilePath);
                IMediaInfo audioInput = await FFmpeg.GetMediaInfo(tempAudioFilePath);

                // Use FFmpeg to merge video and audio streams with optimized arguments for maximum speed
                IConversion conversion = FFmpeg.Conversions.New()
                    .AddStream(videoInput.VideoStreams.First())
                    .AddStream(audioInput.AudioStreams.First())
                    .SetOutput(tempOutputFilePath)
                    .AddParameter("-vf scale=3840:2160 -crf 28 -preset ultrafast -threads 4"); // Optimized for maximum speed and 4K scaling

                await conversion.Start();

                // Read the temporary output file into a memory stream
                MemoryStream outputStream = new MemoryStream();
                using (FileStream fileStream = new FileStream(tempOutputFilePath, FileMode.Open, FileAccess.Read))
                {
                    await fileStream.CopyToAsync(outputStream);
                }

                // Reset the position of the memory stream to the beginning
                outputStream.Position = 0;

                // Return the memory stream and the original video title
                return (outputStream, video.Title);
            }
            finally
            {
                // Delete the temporary files
                if (File.Exists(tempVideoFilePath))
                {
                    File.Delete(tempVideoFilePath);
                }
                if (File.Exists(tempAudioFilePath))
                {
                    File.Delete(tempAudioFilePath);
                }
                if (File.Exists(tempOutputFilePath))
                {
                    File.Delete(tempOutputFilePath);
                }
            }
        }

        public string GetYoutubeVideoIdFromUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
            {
                throw new ArgumentException("The URL cannot be null or empty.", nameof(url));
            }

            // Regular expression to match YouTube video URLs and extract the video ID
            Regex regex = new Regex(@"(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})");
            Match match = regex.Match(url);

            if (!match.Success || match.Groups.Count < 2)
            {
                Log.Error("Invalid YouTube URL. Unable to extract video ID");
                throw new FormatException("Invalid YouTube URL. Unable to extract video ID.");
            }

            Log.Information("\nId found is : " + match.Groups[1].Value);
            return match.Groups[1].Value;
        }
    }
}