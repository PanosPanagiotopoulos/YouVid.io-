namespace YouVid.io___Youtube_Video_Downloader.Models
{
    public class VideoResponse
    {
        public MemoryStream VideoStream { get; set; } = new MemoryStream();
        public string VideoTitle { get; set; }

    }
}
