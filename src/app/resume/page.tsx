import { metatag } from "@/lib/metatag";

export const generateMetadata = () => {
  return metatag({
    title: "Resume | PRAS",
    robots: "index, follow",
  });
};

export default function ResumePage() {
  return (
    <div
      style={{
        fontFamily: '"Times New Roman", Times, serif',
        backgroundColor: "#ffffff",
        color: "#000000",
        minHeight: "100vh",
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
          padding: "40px 20px",
          lineHeight: 1.4,
        }}
      >
        <header style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "32px",
              margin: "0 0 5px 0",
              fontWeight: "normal",
              textTransform: "uppercase",
            }}
          >
            PRAS Samin
          </h1>
          <div style={{ fontSize: "14px" }}>
            <a
              href="mailto:prassamin@gmail.com"
              style={{ color: "#000", textDecoration: "none" }}
            >
              prassamin@gmail.com
            </a>{" "}
            |
            <a
              href="https://pras.me"
              style={{
                color: "#000",
                textDecoration: "none",
                marginLeft: "5px",
              }}
            >
              pras.me
            </a>{" "}
            |
            <a
              href="https://github.com/prassamin"
              style={{
                color: "#000",
                textDecoration: "none",
                marginLeft: "5px",
              }}
            >
              github.com/prassamin
            </a>{" "}
            |
            <a
              href="https://linkedin.com/in/prassamin"
              style={{
                color: "#000",
                textDecoration: "none",
                marginLeft: "5px",
              }}
            >
              linkedin.com/in/prassamin
            </a>
          </div>
        </header>

        <section style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "16px",
              textTransform: "uppercase",
              borderBottom: "1px solid #000",
              margin: "20px 0 10px 0",
              paddingBottom: "2px",
              fontWeight: "bold",
            }}
          >
            Technical Skills
          </h2>
          <div style={{ fontSize: "14px" }}>
            <div style={{ marginBottom: "4px" }}>
              <span style={{ fontWeight: "bold" }}>Languages:</span> Go
              (Golang), TypeScript, JavaScript, Python, SQL, HTML/CSS
            </div>
            <div style={{ marginBottom: "4px" }}>
              <span style={{ fontWeight: "bold" }}>Frontend:</span> React 19,
              Next.js 16 (App Router), Tailwind CSS v4, Framer Motion, GSAP
            </div>
            <div style={{ marginBottom: "4px" }}>
              <span style={{ fontWeight: "bold" }}>Backend & Cloud:</span>{" "}
              Node.js, Prisma, PostgreSQL, MinIO (S3), Supabase, Redis, Vercel
            </div>
            <div style={{ marginBottom: "4px" }}>
              <span style={{ fontWeight: "bold" }}>Tools & Systems:</span> Git,
              Docker, Bun, Linux/KDE Plasmoids, WebCrypto API
            </div>
          </div>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "16px",
              textTransform: "uppercase",
              borderBottom: "1px solid #000",
              margin: "20px 0 10px 0",
              paddingBottom: "2px",
              fontWeight: "bold",
            }}
          >
            Experience
          </h2>

          <div style={{ marginBottom: "15px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                Freelance Full Stack Engineer{" "}
                <span
                  style={{
                    fontStyle: "italic",
                    fontSize: "14px",
                    fontWeight: "normal",
                  }}
                >
                  | OctoMinds Studio
                </span>
              </span>
              <span style={{ fontSize: "14px" }}>Dec 2025 – Jan 2026</span>
            </div>
            <ul style={{ margin: "5px 0 0 0", paddingLeft: "20px" }}>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Engineered{" "}
                <span style={{ fontWeight: "bold" }}>Teppantora</span>, a
                comprehensive restaurant management web platform utilizing
                Next.js 16 (App Router) and the React 19 Compiler. (
                <a
                  href="https://teppantorabd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#000", textDecoration: "underline" }}
                >
                  Live Link
                </a>
                )
              </li>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Developed scalable and complex database architectures using
                Prisma ORM with PostgreSQL, handling robust transactional
                capabilities.
              </li>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Integrated MinIO (S3-compatible) storage for performant media
                hosting and Better-Auth for resilient, secure session
                management.
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                Software Engineer Intern{" "}
                <span
                  style={{
                    fontStyle: "italic",
                    fontSize: "14px",
                    fontWeight: "normal",
                  }}
                >
                  | Divine IT Limited
                </span>
              </span>
              <span style={{ fontSize: "14px" }}>June 2024 – Dec 2024</span>
            </div>
            <ul style={{ margin: "5px 0 0 0", paddingLeft: "20px" }}>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Collaborated with specialized engineering teams to design,
                implement, and test robust backend APIs and scalable frontend
                architectures.
              </li>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Optimized relational database queries and streamlined data
                pipelines, directly contributing to significantly improved
                system load times.
              </li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "16px",
              textTransform: "uppercase",
              borderBottom: "1px solid #000",
              margin: "20px 0 10px 0",
              paddingBottom: "2px",
              fontWeight: "bold",
            }}
          >
            Technical Projects
          </h2>

          <div style={{ marginBottom: "15px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                EnvDrop - Secret Sharing Platform{" "}
                <span
                  style={{
                    fontStyle: "italic",
                    fontSize: "14px",
                    fontWeight: "normal",
                  }}
                >
                  | Next.js, Redis, RedEnv Crypto |{" "}
                  <a
                    href="https://github.com/redenv-labs/envdrop"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#000", textDecoration: "underline" }}
                  >
                    GitHub
                  </a>{" "}
                  •{" "}
                  <a
                    href="https://envdrop.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#000", textDecoration: "underline" }}
                  >
                    Live
                  </a>
                </span>
              </span>
              <span style={{ fontSize: "14px" }}>March 2026 – Present</span>
            </div>
            <ul style={{ margin: "5px 0 0 0", paddingLeft: "20px" }}>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Architected a secure, zero-knowledge secret sharing web
                application built specifically to facilitate the safe transfer
                of sensitive environment variables.
              </li>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Leveraged Upstash Redis for high-speed temporary storage and
                strict rate-limiting to prevent abuse and brute-force attacks.
              </li>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Implemented client-side cryptography utilizing the{" "}
                <code>@redenv/e2ee</code> package, ensuring secrets are
                encrypted before ever touching the backend.
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                RedEnv - Secret Management Software{" "}
                <span
                  style={{
                    fontStyle: "italic",
                    fontSize: "14px",
                    fontWeight: "normal",
                  }}
                >
                  | JS/Python SDKs, Upstash |{" "}
                  <a
                    href="https://github.com/redenv-labs/redenv"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#000", textDecoration: "underline" }}
                  >
                    GitHub
                  </a>{" "}
                  •{" "}
                  <a
                    href="https://redenv.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#000", textDecoration: "underline" }}
                  >
                    Live
                  </a>
                </span>
              </span>
              <span style={{ fontSize: "14px" }}>Nov 2025 – Present</span>
            </div>
            <ul style={{ margin: "5px 0 0 0", paddingLeft: "20px" }}>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Developed a full-scale Secret Management system utilizing
                Upstash Redis as a high-performance backend store for
                environment variables.
              </li>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Engineered robust, native Python and JavaScript SDKs, empowering
                applications in diverse ecosystems to seamlessly configure and
                manage their environment variables dynamically.
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                Prasmoid CLI{" "}
                <span
                  style={{
                    fontStyle: "italic",
                    fontSize: "14px",
                    fontWeight: "normal",
                  }}
                >
                  | Go, Embedded JS, KDE |{" "}
                  <a
                    href="https://github.com/prassamin/prasmoid"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#000", textDecoration: "underline" }}
                  >
                    GitHub
                  </a>
                </span>
              </span>
              <span style={{ fontSize: "14px" }}>July 2025 – Oct 2025</span>
            </div>
            <ul style={{ margin: "5px 0 0 0", paddingLeft: "20px" }}>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Engineered an open-source command-line toolkit in Go for
                generating, testing, and formatting Linux KDE desktop plasmoids.
              </li>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Architected a custom, zero-dependency embedded JavaScript
                runtime within the Go binary, allowing developers to extend the
                CLI using synchronous Node.js-style scripts out of the box.
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                Fetchy Neon - Video Downloader Platform{" "}
                <span
                  style={{
                    fontStyle: "italic",
                    fontSize: "14px",
                    fontWeight: "normal",
                  }}
                >
                  | Next.js, Bun, Redis |{" "}
                  <a
                    href="https://github.com/prassamin/fetchy"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#000", textDecoration: "underline" }}
                  >
                    GitHub
                  </a>{" "}
                  •{" "}
                  <a
                    href="https://gofetchy.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#000", textDecoration: "underline" }}
                  >
                    Live
                  </a>
                </span>
              </span>
              <span style={{ fontSize: "14px" }}>Feb 2024 – Present</span>
            </div>
            <ul style={{ margin: "5px 0 0 0", paddingLeft: "20px" }}>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Architected a high-performance video downloading platform
                specifically designed to scrape and process social media content
                reliably across Instagram, TikTok, and Facebook.
              </li>
              <li style={{ fontSize: "14px", marginBottom: "4px" }}>
                Optimized memory allocation and execution speed seamlessly by
                adopting the Bun runtime alongside dynamic edge caching via
                Redis for concurrent scraping instances.
              </li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "16px",
              textTransform: "uppercase",
              borderBottom: "1px solid #000",
              margin: "20px 0 10px 0",
              paddingBottom: "2px",
              fontWeight: "bold",
            }}
          >
            Education
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "15px",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: "15px" }}>
              Noakhali Ideal Polytechnic Institute{" "}
              <span
                style={{
                  fontStyle: "italic",
                  fontSize: "14px",
                  fontWeight: "normal",
                }}
              >
                | Diploma in Engineering, Computer Science
              </span>
            </span>
            <span style={{ fontSize: "14px" }}>2020 – 2025</span>
          </div>
        </section>
      </div>
    </div>
  );
}
