import React from 'react';
import Layout from '@theme/Layout';

export default function Home(): React.ReactNode {
  return (
    <Layout
      title="Netra Pawar"
      description="A technical writer exploring documentation, systems, and trust."
    >
      <main className="np-home">
        <section className="np-hero">

          <h1>How knowledge holds</h1>

          <p className="np-lede">
            I’m a curious human who happens to be a technical writer.
          </p>

          <p className="np-body">
            I’m exploring how documentation works as a product: how it helps
            people learn, decide, build, troubleshoot, and trust complex
            systems.
          </p>

          <p className="np-body">
            I’m especially interested in scalable documentation systems for
            enterprises — systems that support teams, products, support
            workflows, humans, tools, search systems, and increasingly, AI
            systems.
          </p>

          <p className="np-body">
            The repeatable parts of documentation work can often be automated.
            The parts that carry judgement and consequence still need people.
          </p>

          <div className="np-actions">
            <a className="np-button np-button-primary" href="/blog">
              Read articles
            </a>
            <a className="np-button np-button-secondary" href="/experiments">
              Explore experiments
            </a>
          </div>
        </section>
      </main>
    </Layout>
  );
}