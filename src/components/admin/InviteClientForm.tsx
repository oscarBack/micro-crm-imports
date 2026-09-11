import { useState } from "react";
import type { FormEventHandler } from "react";

type InviteState =
  | { status: "idle"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const initialState: InviteState = { status: "idle", message: "" };

export const InviteClientForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteState, setInviteState] = useState<InviteState>(initialState);

  const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setInviteState(initialState);

    try {
      const response = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
        }),
      });

      const payload = (await response.json()) as { message?: string; email?: string };

      if (!response.ok) {
        setInviteState({
          status: "error",
          message: payload.message ?? "Invitation failed.",
        });
        return;
      }

      setInviteState({
        status: "success",
        message: payload.email
          ? `Invitation sent to ${payload.email}.`
          : "Invitation created successfully.",
      });
      setEmail("");
      setName("");
    } catch {
      setInviteState({
        status: "error",
        message: "Unable to reach the invitation endpoint.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        <h2 className="card-title">Invite client</h2>
        <p className="text-sm text-base-content/80">
          Admins can send a Clerk magic invitation to onboard clients.
        </p>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <label className="form-control">
            <span className="label-text">Client name (optional)</span>
            <input
              className="input input-bordered"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="form-control">
            <span className="label-text">Client email</span>
            <input
              className="input input-bordered"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <div className="md:col-span-2">
            <button className="btn btn-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Sending..." : "Send invitation"}
            </button>
          </div>
        </form>

        {inviteState.status !== "idle" ? (
          <p
            className={inviteState.status === "success" ? "text-success" : "text-error"}
            role="status"
          >
            {inviteState.message}
          </p>
        ) : null}
      </div>
    </section>
  );
};
