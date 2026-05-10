import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button";

describe("Button", () => {
  it("renders children and reacts to clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Sign in</Button>);
    const btn = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled while loading", () => {
    render(<Button loading>Working</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("supports the danger variant", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-rose-600");
  });
});
