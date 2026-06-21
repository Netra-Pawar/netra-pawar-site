import React from 'react';
import Layout from '@theme/Layout';

export default function About(): React.ReactNode {
  return (
    <Layout
      title="About"
      description="About Netra Pawar — technical writer and documentation engineer."
    >
      <main className="np-about-page">
        <section className="np-about-hero">
          <p className="np-kicker">About</p>

          <h1>I’m a curious human who happens to be a technical writer.</h1>

          <p className="np-about-lede">
            I work at the intersection of documentation, product knowledge,
            support systems, and AI-assisted workflows — exploring how complex
            knowledge becomes clear, usable, and trustworthy at scale.
          </p>
        </section>

        <section className="np-about-grid" aria-label="About Netra Pawar">
          <article className="np-about-panel np-about-panel-large">
            <p className="np-panel-label">What I explore</p>
            <h2>How documentation works as a product.</h2>
            <p>
              Over time, I’ve become interested not only in writing
              documentation, but in understanding how it helps people learn,
              decide, build, troubleshoot, and trust complex systems.
            </p>
          </article>

          <article className="np-about-panel">
            <p className="np-panel-label">What I build</p>
            <h2>Systems that help knowledge scale.</h2>
            <p>
              I’m especially drawn to enterprise documentation systems that
              support many teams, products, support workflows, and knowledge
              consumers at once — including people, tools, search systems, and
              AI assistants.
            </p>
          </article>

          <article className="np-about-panel">
            <p className="np-panel-label">What I believe</p>
            <h2>Automation should not replace judgment.</h2>
            <p>
              The repeatable parts of documentation work can often be automated:
              detecting drift, finding gaps, generating drafts, checking
              examples, measuring quality, or surfacing signals.
            </p>
            <p>
              The parts that carry consequence still need people: setting goals,
              validating meaning, reviewing accuracy, understanding users, and
              owning trust.
            </p>
          </article>
        </section>

        <section className="np-about-closing">
          <p>
            This site is my public space for exploring those questions through
            articles, experiments, research notes, and hands-on builds.
          </p>
        </section>
      </main>
    </Layout>
  );
}