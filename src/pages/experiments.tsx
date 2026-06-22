import React from 'react';
import Layout from '@theme/Layout';

export default function Experiments(): React.ReactNode {
  return (
    <Layout
      title="Experiments"
      description="Documentation engineering experiments by Netra Pawar."
    >
      <main className="np-experiments-page">
        <section className="np-experiments-hero">
          <p className="np-kicker">Experiments</p>

          <h1>Small builds around big documentation questions.</h1>

          <p className="np-experiments-lede">
            This is where I explore documentation engineering through practical
            prototypes, lightweight systems, and hands-on tests — not as polished
            case studies too early, but as a way to understand how knowledge
            becomes useful at scale.
          </p>
        </section>

        <section className="np-experiments-grid" aria-label="Experiments">
          <article className="np-experiment-card np-experiment-card-featured">
            <p className="np-panel-label">First experiment</p>
            <h2>What drift can an API contract catch?</h2>
            <p>
              A small hands-on project using an OpenAPI file, a quickstart
              example, and automated checks to understand where API contracts
              help — and where they do not.
            </p>
            <a href="/docs/intro">Read the experiment brief →</a>
          </article>

          <article className="np-experiment-card">
            <p className="np-panel-label">Coming next</p>
            <h2>When docs look fine but retrieval fails</h2>
            <p>
              An exploration of how page structure, chunking, headings, and
              learning objectives affect whether AI assistants can retrieve the
              right source content.
            </p>
          </article>

          <article className="np-experiment-card">
            <p className="np-panel-label">Coming next</p>
            <h2>What should documentation teams measure?</h2>
            <p>
              A lightweight analytics model for moving beyond page views toward
              signals like task completion, code-copy events, feedback quality,
              and content usefulness.
            </p>
          </article>
        </section>
      </main>
    </Layout>
  );
}