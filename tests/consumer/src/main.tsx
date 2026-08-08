import "@jflamb/keycaps-tokens";
import "@jflamb/keycaps-react/styles.css";
import { Button, Field } from "@jflamb/keycaps-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

function ConsumerFixture() {
  return (
    <main style={{ margin: "2rem auto", maxWidth: "36rem", padding: "1rem" }}>
      <h1>Package consumption proof</h1>
      <Field label="Project name" inputProps={{ defaultValue: "Keycaps" }} />
      <p>
        <Button>Save project</Button>
      </p>
    </main>
  );
}

const root = document.getElementById("root");

if (!root) throw new Error("Missing root element");

createRoot(root).render(
  <StrictMode>
    <ConsumerFixture />
  </StrictMode>,
);
