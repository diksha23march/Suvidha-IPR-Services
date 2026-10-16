
import { useState } from "react";
import "./EnquiryForm.css";

const API_BASE_URL = "http://localhost:5000/api";

const initialValues = {
  applicant_name: "",
  email: "",
  phone: "",
  organization: "",
  invention_title: "",
  invention_summary: "",
  public_disclosure: "unsure",
  work_title: "",
  work_type: "",
  work_description: "",
};

function EnquiryForm({ type, onClose }) {
  const isPatent = type === "patent";
  const [form, setForm] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const payload = isPatent
      ? {
          applicant_name: form.applicant_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          organization: form.organization.trim(),
          invention_title: form.invention_title.trim(),
          invention_summary: form.invention_summary.trim(),
          public_disclosure: form.public_disclosure,
        }
      : {
          applicant_name: form.applicant_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          organization: form.organization.trim(),
          work_title: form.work_title.trim(),
          work_type: form.work_type,
          work_description: form.work_description.trim(),
        };

    try {
      const response = await fetch(
        `${API_BASE_URL}/enquiries/${type}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to submit your enquiry."
        );
      }

      setMessage(
        `Your enquiry was received successfully. Reference number: ${result.enquiry.id}`
      );
      setForm(initialValues);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Could not connect to the server. Please try again."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="enquiry-section" id="enquiry-form">
      <div className="enquiry-heading">
        <span className="section-kicker">START YOUR ENQUIRY</span>
        <h2>
          {isPatent ? "Patent" : "Copyright"} <span>Assistance</span>
        </h2>
        <p>
          Share your basic details so the team can understand your
          requirements and guide you on the next steps.
        </p>
      </div>

      <form className="enquiry-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Full name *
            <input
              name="applicant_name"
              value={form.applicant_name}
              onChange={handleChange}
              maxLength={150}
              autoComplete="name"
              required
            />
          </label>

          <label>
            Email address *
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              maxLength={254}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Phone number
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength={30}
              autoComplete="tel"
            />
          </label>

          <label>
            Organisation (optional)
            <input
              name="organization"
              value={form.organization}
              onChange={handleChange}
              maxLength={200}
              autoComplete="organization"
            />
          </label>

          {isPatent ? (
            <>
              <label className="full-width">
                Invention title *
                <input
                  name="invention_title"
                  value={form.invention_title}
                  onChange={handleChange}
                  maxLength={250}
                  required
                />
              </label>

              <label className="full-width">
                Brief, non-confidential description *
                <textarea
                  name="invention_summary"
                  value={form.invention_summary}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </label>

              <label className="full-width">
                Has this invention been publicly disclosed? *
                <select
                  name="public_disclosure"
                  value={form.public_disclosure}
                  onChange={handleChange}
                  required
                >
                  <option value="unsure">Not sure</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label className="full-width">
                Title of the work *
                <input
                  name="work_title"
                  value={form.work_title}
                  onChange={handleChange}
                  maxLength={250}
                  required
                />
              </label>

              <label className="full-width">
                Type of work *
                <select
                  name="work_type"
                  value={form.work_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a work type</option>
                  <option value="literary">Literary work</option>
                  <option value="artistic">Artistic work</option>
                  <option value="musical">Musical work</option>
                  <option value="software">Software</option>
                  <option value="cinematograph">Cinematograph film</option>
                  <option value="sound_recording">Sound recording</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="full-width">
                Brief description of the work *
                <textarea
                  name="work_description"
                  value={form.work_description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </label>
            </>
          )}
        </div>

        <p className="form-disclaimer">
          Please do not submit confidential invention details, unpublished
          technical information, original work files, or attachments through
          this form. Use only a brief, non-confidential description.
        </p>

        {error && (
          <p className="form-message form-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="form-message form-success" role="status">
            {message}
          </p>
        )}

        <div className="form-actions">
          <button
            className="button-secondary"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="button-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Enquiry"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default EnquiryForm;
