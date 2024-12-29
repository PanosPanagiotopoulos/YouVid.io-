namespace YouVid.io___Youtube_Video_Downloader.Models
{
    public class VideoResponse
    {
        public Stream VideoStream { get; set; } = new MemoryStream();
        public string? VideoTitle { get; set; } = "video.mp4";
        public string? MimeType { get; set; } = "video/mp4";


    }
}
