import React from "react";
import Document, { Head, Main, NextScript } from "next/document";
import { renderStatic } from "glamor/server";

export default class MyDocument extends Document {
  static async getInitialProps({ renderPage }) {
    const page = renderPage();
    const styles = renderStatic(() => page.html);
    return { ...page, ...styles };
  }

  constructor(props) {
    super(props);

    const { __NEXT_DATA__, ids } = props;
    if (ids) {
      __NEXT_DATA__.ids = this.props.ids;
    }
  }

  render() {
    return (
      <html lang="en">
        <Head>
          {/* TODO: check if it will get duplicated by Next */}
          <meta charSet="utf-8" />
          <title>Hurtak.cc</title>

          {/* Favicons */}
          <link
            rel="icon"
            type="image/png"
            href="/static/favicons/favicon.png"
            sizes="16x16"
          />

          {/* Meta */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <style dangerouslySetInnerHTML={{ __html: this.props.css }} />

          {/* Extra */}
          <link rel="alternate" type="application/rss+xml" href="/rss" />
          {/* <link type="text/plain" rel="author" href="/humans.txt" /> */}
        </Head>
        <body>
          <Main />
          <NextScript />

          {/* Google analytics */}
          {/* https://phpfashion.com/rychlejsi-stranky-s-google-universal-analytics */}
          {
            // TODO: take GA token from config
          }
          <script
            dangerouslySetInnerHTML={{
              __html: `
                ga = function() { ga.q.push(arguments); };
                ga.q = [];
                ga.l = new Date().getTime();
                ga("create", "UA-93333552-1", "auto");
                ga("send", "pageview");
              `
            }}
          />
          <script
            src="https://www.google-analytics.com/analytics.js"
            async
            defer
          />
        </body>
      </html>
    );
  }
}