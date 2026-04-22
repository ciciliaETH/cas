import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="shortcut icon" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <meta name="theme-color" content="#0D0E2A" />
      </Head>
      <body className="bg-[#0D0E2A]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
