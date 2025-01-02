using Newtonsoft.Json;
using System.Net;

public class CookieService
{
    private readonly string _cookieFilePath;

    public CookieService(string cookieFilePath)
    {
        _cookieFilePath = cookieFilePath;
    }

    /// <summary>
    /// Reads cookies from the JSON file and configures an HttpClient with these cookies.
    /// Ensures cookies have a minimum expiration of 3 years from the current date.
    /// </summary>
    /// <returns>HttpClient with cookies applied.</returns>
    public HttpClient GetHttpClientWithCookies()
    {
        // Load cookies from the file
        string cookieJson = File.ReadAllText(_cookieFilePath);

        // Parse and adjust cookies
        List<Cookie> cookies = ParseAndAdjustCookies(cookieJson);

        // Add cookies to a CookieContainer
        CookieContainer cookieContainer = new CookieContainer();
        foreach (var cookie in cookies)
        {
            cookieContainer.Add(cookie);
        }

        // Configure HttpClientHandler with the CookieContainer
        HttpClientHandler handler = new HttpClientHandler
        {
            CookieContainer = cookieContainer,
            UseCookies = true
        };

        // Return an HttpClient instance configured with the handler
        return new HttpClient(handler);
    }

    /// <summary>
    /// Parses cookies from JSON and adjusts their expiration dates to ensure a minimum of 3 years.
    /// </summary>
    /// <param name="cookieJson">The JSON string representing cookies.</param>
    /// <returns>List of adjusted Cookie objects.</returns>
    private List<Cookie> ParseAndAdjustCookies(string cookieJson)
    {
        List<Cookie> cookies = new List<Cookie>();
        List<RawCookie>? cookieList = JsonConvert.DeserializeObject<List<RawCookie>>(cookieJson);

        foreach (var rawCookie in cookieList)
        {
            // Parse expirationDate if present, otherwise assume it's a session cookie
            DateTime? expiration = rawCookie.expirationDate.HasValue
                ? DateTimeOffset.FromUnixTimeSeconds((long)rawCookie.expirationDate.Value).UtcDateTime
                : (DateTime?)null;

            // Ensure expiration is at least 3 years from today
            DateTime minimumExpiration = DateTime.UtcNow.AddYears(3);
            if (expiration == null || expiration < minimumExpiration)
            {
                expiration = minimumExpiration;
            }

            // Create a Cookie object
            Cookie cookie = new Cookie(rawCookie.name, rawCookie.value, rawCookie.path, rawCookie.domain)
            {
                Secure = rawCookie.secure,
                HttpOnly = rawCookie.httpOnly,
                Expires = expiration.Value
            };

            cookies.Add(cookie);
        }

        return cookies;
    }

    /// <summary>
    /// Represents the structure of cookies in the JSON file.
    /// </summary>
    private class RawCookie
    {
        public string domain { get; set; }
        public string name { get; set; }
        public string value { get; set; }
        public string path { get; set; }
        public bool secure { get; set; }
        public bool httpOnly { get; set; }
        public double? expirationDate { get; set; }
    }
}
