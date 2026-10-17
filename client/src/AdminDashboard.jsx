
import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const STATUSES = [
  "new",
  "under_review",
  "awaiting_information",
  "in_progress",
  "completed",
  "closed",
];

const STATUS_LABELS = {
  new: "New",
  under_review: "Under Review",
  awaiting_information: "Awaiting Information",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
};

function formatStatus(status) {
  return STATUS_LABELS[status] || status || "Unknown";
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function readResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function AdminDashboard() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [activeType, setActiveType] = useState("patent");
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;

    async function loadEnquiries() {
      setLoading(true);
      setError("");
      setNotice("");
      setEnquiries([]);

      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/enquiries/${activeType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await readResponse(response);

        if (cancelled) return;

        if (response.status === 401) {
          setToken("");
          setAdminEmail("");
          setEnquiries([]);
          setError("Your session has expired. Please log in again.");
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load enquiries.");
        }

        const records = Array.isArray(result.enquiries)
          ? result.enquiries
          : [];

        setEnquiries(records);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message === "Failed to fetch"
              ? "Cannot connect to the server. Make sure your backend is running."
              : err.message || "Unable to load enquiries."
          );
          setEnquiries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEnquiries();

    return () => {
      cancelled = true;
    };
  }, [token, activeType, refreshKey]);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoginLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await readResponse(response);

      if (!response.ok || !result.success || !result.token) {
        throw new Error(result.message || "Login failed.");
      }

      setAdminEmail(result.admin?.email || email.trim());
      setPassword("");
      setEnquiries([]);
      setActiveType("patent");
      setToken(result.token);
      setNotice("Login successful.");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Make sure your backend is running."
          : err.message || "Unable to log in."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    if (!STATUSES.includes(newStatus)) {
      setError("Please select a valid status.");
      return;
    }

    setError("");
    setNotice("");
    setUpdatingId(id);

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/enquiries/${activeType}/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await readResponse(response);

      if (response.status === 401) {
        setToken("");
        setAdminEmail("");
        setEnquiries([]);
        setError("Your session has expired. Please log in again.");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update status.");
      }

      setEnquiries((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                ...(result.enquiry || {}),
                status: result.enquiry?.status || newStatus,
              }
            : item
        )
      );

      setNotice(`Enquiry #${id} status updated successfully.`);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check that it is running."
          : err.message || "Unable to update status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function handleLogout() {
    setToken("");
    setAdminEmail("");
    setPassword("");
    setEnquiries([]);
    setError("");
    setNotice("");
    setActiveType("patent");
  }

  if (!token) {
    return (
      <main className="admin-page admin-login-page">
        <a className="admin-brand" href="/">
          <span className="admin-brand-mark">S</span>
          <span>
            <strong>Suvidha</strong>
            <small>IPR SERVICES</small>
          </span>
        </a>

        <section className="admin-login-card">
          <span className="admin-eyebrow">SECURE ADMINISTRATION</span>
          <h1>Welcome back.</h1>
          <p className="admin-subtitle">
            Sign in to manage patent and copyright enquiries.
          </p>

          {error && (
            <p className="admin-alert admin-alert-error" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="admin-login-form">
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button
              className="admin-primary-button"
              type="submit"
              disabled={loginLoading}
            >
              {loginLoading ? "Signing in..." : "Sign in securely"}
            </button>
          </form>

          <p className="admin-login-note">Authorized administrators only.</p>

          <a className="admin-back-link" href="/">
            ← Back to website
          </a>
        </section>
      </main>
    );
  }

  const patentCount =
    activeType === "patent" ? enquiries.length : 0;
  const copyrightCount =
    activeType === "copyright" ? enquiries.length : 0;

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a className="admin-brand" href="/">
          <span className="admin-brand-mark">S</span>
          <span>
            <strong>Suvidha</strong>
            <small>IPR SERVICES</small>
          </span>
        </a>

        <div className="admin-header-actions">
          <span className="admin-user">
            <span className="admin-user-dot" />
            {adminEmail}
          </span>
          <button
            className="admin-logout-button"
            onClick={handleLogout}
            type="button"
          >
            Log out
          </button>
        </div>
      </header>

      <section className="admin-content">
        <div className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">ADMINISTRATION</span>
            <h1>Enquiry management</h1>
            <p>Review submissions and keep case statuses up to date.</p>
          </div>

          <a className="admin-back-link" href="/">
            View public website ↗
          </a>
        </div>

        <div className="admin-summary-grid">
          <article className="admin-summary-card">
            <span>Patent enquiries</span>
            <strong>{patentCount}</strong>
            <small>
              {activeType === "patent"
                ? "Loaded records"
                : "Select the patent tab to view"}
            </small>
          </article>

          <article className="admin-summary-card">
            <span>Copyright enquiries</span>
            <strong>{copyrightCount}</strong>
            <small>
              {activeType === "copyright"
                ? "Loaded records"
                : "Select the copyright tab to view"}
            </small>
          </article>

          <article className="admin-summary-card admin-summary-total">
            <span>Current view</span>
            <strong>{enquiries.length}</strong>
            <small>Up to 100 most recent records</small>
          </article>
        </div>

        <section className="admin-records-panel">
          <div className="admin-records-heading">
            <div>
              <h2>Enquiry records</h2>
              <p>Review details and update each enquiry's status.</p>
            </div>

            <button
              type="button"
              className="admin-refresh-button"
              onClick={() => setRefreshKey((current) => current + 1)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="admin-tabs" role="tablist" aria-label="Enquiry type">
            <button
              type="button"
              role="tab"
              aria-selected={activeType === "patent"}
              className={activeType === "patent" ? "active" : ""}
              onClick={() => {
                if (activeType !== "patent") setActiveType("patent");
                setError("");
                setNotice("");
              }}
            >
              Patent enquiries
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeType === "copyright"}
              className={activeType === "copyright" ? "active" : ""}
              onClick={() => {
                if (activeType !== "copyright") setActiveType("copyright");
                setError("");
                setNotice("");
              }}
            >
              Copyright enquiries
            </button>
          </div>

          {error && (
            <p className="admin-alert admin-alert-error" role="alert">
              {error}
            </p>
          )}

          {notice && (
            <p className="admin-alert admin-alert-success" role="status">
              {notice}
            </p>
          )}

          {loading ? (
            <div className="admin-empty-state">Loading enquiries...</div>
          ) : enquiries.length === 0 ? (
            <div className="admin-empty-state">
              <span className="admin-empty-icon">◇</span>
              <h3>No enquiries to display</h3>
              <p>New {activeType} submissions will appear here.</p>
            </div>
          ) : (
            <div className="admin-enquiry-list">
              {enquiries.map((item) => {
                const isPatent = activeType === "patent";
                const title = isPatent
                  ? item.invention_title || "Untitled invention"
                  : item.work_title || "Untitled work";
                const description = isPatent
                  ? item.invention_summary || "No invention summary provided."
                  : item.work_description || "No work description provided.";
                const status = item.status || "new";
                const workType = (item.work_type || "other").replaceAll(
                  "_",
                  " "
                );

                return (
                  <article className="admin-enquiry-card" key={item.id}>
                    <div className="admin-enquiry-top">
                      <div>
                        <span className="admin-reference">
                          REF #{item.id ?? "N/A"} ·{" "}
                          {isPatent ? "PATENT" : "COPYRIGHT"}
                        </span>
                        <h3>{title}</h3>
                      </div>

                      <span
                        className={`admin-status status-${status.replaceAll(
                          "_",
                          "-"
                        )}`}
                      >
                        {formatStatus(status)}
                      </span>
                    </div>

                    <div className="admin-applicant">
                      <strong>{item.applicant_name || "Applicant unavailable"}</strong>
                      {item.email ? (
                        <a href={`mailto:${item.email}`}>{item.email}</a>
                      ) : (
                        <span>Email not provided</span>
                      )}
                      {item.phone && <span>{item.phone}</span>}
                      {item.organization && <span>{item.organization}</span>}
                    </div>

                    <div className="admin-details">
                      <div>
                        <span>Type</span>
                        <strong>
                          {isPatent ? "Patent enquiry" : workType}
                        </strong>
                      </div>

                      {isPatent && (
                        <div>
                          <span>Public disclosure</span>
                          <strong>{item.public_disclosure || "unsure"}</strong>
                        </div>
                      )}

                      <div>
                        <span>Submitted</span>
                        <strong>{formatDate(item.created_at)}</strong>
                      </div>
                    </div>

                    <details className="admin-description">
                      <summary>View enquiry description</summary>
                      <p>{description}</p>
                    </details>

                    <div className="admin-status-control">
                      <label htmlFor={`status-${activeType}-${item.id}`}>
                        Update case status
                      </label>
                      <select
                        id={`status-${activeType}-${item.id}`}
                        value={STATUSES.includes(status) ? status : "new"}
                        disabled={updatingId === item.id}
                        onChange={(event) =>
                          handleStatusChange(item.id, event.target.value)
                        }
                      >
                        {STATUSES.map((optionStatus) => (
                          <option key={optionStatus} value={optionStatus}>
                            {formatStatus(optionStatus)}
                          </option>
                        ))}
                      </select>

                      {updatingId === item.id && (
                        <span className="admin-saving">Saving...</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="admin-security-note">
          Administrative information is confidential. Only access records you
          are authorized to review. This development dashboard does not provide
          secure document storage.
        </p>
      </section>
    </main>
  );
}

export default AdminDashboard;
