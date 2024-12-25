import { Component } from "@angular/core";

@Component({
  selector: "app-footer",
  standalone: true,
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p class="copyright">© 2024 YouVid.io</p>
        <div class="footer-links">
          <a href="/" class="footer-link">Terms</a>
          <a href="/" class="footer-link">Privacy</a>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        position: relative;
        padding: 2rem;
        margin-top: 4rem;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        z-index: 1;
      }

      .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .copyright {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
      }

      .footer-links {
        display: flex;
        gap: 2rem;
      }

      .footer-link {
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        transition: color 0.3s ease;
        font-size: 0.9rem;
      }

      .footer-link:hover {
        color: #ff0000;
      }
    `,
  ],
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
}
