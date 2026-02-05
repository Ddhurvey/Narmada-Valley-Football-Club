import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "@/app/page";

describe("Home Page", () => {
  it("renders the hero section", () => {
    render(<Home />);
    expect(screen.getByText(/Narmada Valley Football Club/i)).toBeInTheDocument();
  });

  it("displays the countdown timer", () => {
    render(<Home />);
    expect(screen.getByText(/Next Match/i)).toBeInTheDocument();
  });
});
