// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PatientRecordForm } from "@/components/PatientRecordForm";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("Patient name"), { target: { value: "Amina Yusuf" } });
  fireEvent.change(screen.getByLabelText("Age"), { target: { value: "29" } });
  fireEvent.change(screen.getByLabelText("Blood group"), { target: { value: "O+" } });
  fireEvent.change(screen.getByLabelText("Genotype"), { target: { value: "AS" } });
  fireEvent.change(screen.getByLabelText("Language"), { target: { value: "Hausa" } });
  fireEvent.change(screen.getByLabelText("Contact name"), { target: { value: "Musa Yusuf" } });
  fireEvent.change(screen.getByLabelText("Contact phone"), { target: { value: "+2348012345678" } });
  fireEvent.change(screen.getByLabelText("Relationship"), { target: { value: "Spouse" } });
}

describe("PatientRecordForm", () => {
  it("shows validation errors instead of submitting when required fields are missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<PatientRecordForm />);
    fireEvent.click(screen.getByRole("button", { name: /save patient record/i }));

    expect(await screen.findByText(/^name is required$/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits the parsed record to POST /api/records and shows the saved id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ record: { id: "rec_123" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PatientRecordForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /save patient record/i }));

    expect(await screen.findByRole("button", { name: /attest on-chain/i })).toBeInTheDocument();
    expect(screen.getByText(/rec_123/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/records",
      expect.objectContaining({ method: "POST" }),
    );

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const sentBody = JSON.parse(requestInit.body as string);
    expect(sentBody.name).toBe("Amina Yusuf");
    expect(sentBody.emergencyContacts).toHaveLength(1);
  });

  it("shows a server error message when the API rejects the submission", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "This health worker is not on the attester allowlist" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PatientRecordForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /save patient record/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/not on the attester allowlist/i);
  });
});
