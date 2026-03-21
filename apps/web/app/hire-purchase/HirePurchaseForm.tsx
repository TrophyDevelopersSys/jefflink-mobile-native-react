"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

type FieldType = "text" | "email" | "date" | "number";
type RenderAs = "input" | "textarea" | "select";

type FormField = {
  key: keyof HirePurchaseFormState;
  label: string;
  placeholder?: string;
  type?: FieldType;
  as?: RenderAs;
  options?: readonly string[];
  fullWidth?: boolean;
};

type FormSection = {
  title: string;
  description: string;
  fields: readonly FormField[];
};

type HirePurchaseFormState = {
  applicationNo: string;
  applicationDate: string;
  firstName: string;
  middleName: string;
  lastName: string;
  maidenName: string;
  gender: string;
  civilStatus: string;
  birthDate: string;
  age: string;
  birthPlace: string;
  nationality: string;
  nationalId: string;
  tin: string;
  homeAddress: string;
  workAddress: string;
  homePhone: string;
  officePhone: string;
  mobilePhone: string;
  email: string;
  employeeId: string;
  employerName: string;
  employerAddress: string;
  homeOwnership: string;
  durationAtAddress: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  monthlyNetIncome: string;
  postdatedCheques: string;
  otherPayables: string;
  vehicleType: string;
  vehiclePurpose: string;
  paymentFrequency: string;
  hirePurchasePrice: string;
  downPaymentAmount: string;
  cashPrice: string;
  periodTerm: string;
  bodyType: string;
  bodyColor: string;
  cylinders: string;
  keyType: string;
  engineNumber: string;
  model: string;
  make: string;
  dateOfManufacture: string;
  chassisNumber: string;
  engineSize: string;
  insuranceProvider: string;
  insurancePolicyType: string;
  currentLoan: string;
  loanDetails: string;
  driverPermitNumber: string;
  permitIssueDate: string;
  permitExpiryDate: string;
  emergencyContactName: string;
  emergencyContactAddress: string;
  emergencyContactPhone: string;
  guarantorName: string;
  nextOfKinName: string;
  applicantSignatureName: string;
  scheduleMake: string;
  scheduleYearOfManufacture: string;
  scheduleChassisNumber: string;
  scheduleRegistrationNumber: string;
  scheduleInsuranceCompany: string;
  schedulePolicyExpiryDate: string;
};

const CIVIL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Widow/er",
  "Annulled",
  "Legally Separated",
] as const;

const GENDER_OPTIONS = ["Male", "Female"] as const;
const VEHICLE_TYPE_OPTIONS = ["New", "Used"] as const;
const VEHICLE_PURPOSE_OPTIONS = ["Personal Use", "Business"] as const;
const PAYMENT_OPTIONS = ["Weekly", "Monthly"] as const;
const PERIOD_OPTIONS = ["1 Year", "2 Years", "2.5 Years", "3 Years", "4 Years", "5 Years"] as const;
const HOME_OWNERSHIP_OPTIONS = ["Own", "Rent"] as const;
const KEY_TYPE_OPTIONS = ["Remote", "No-Remote"] as const;
const LOAN_OPTIONS = ["No", "Yes"] as const;

const AGREEMENT_TERMS = [
  "The hirer pays agreed rent and initial deposit to JeffLink's nominated account.",
  "Postdated cheques are issued by the hirer as vehicle security.",
  "The vehicle must not be sold, pledged, transferred, or taken outside Uganda without written consent.",
  "The hirer keeps the vehicle in good repair and allows inspection by the owner.",
  "The hirer pays road tax, license fees, duties, and related statutory charges.",
  "Comprehensive insurance is maintained in owner and hirer names with approved insurer.",
  "A GPS tracking device must remain installed and functional throughout the term.",
  "Regular mechanical service is done by the hirer at their own cost.",
  "Default in payment or breach may allow repossession and additional recovery action.",
  "Ownership transfers only after full settlement of hire purchase obligations.",
  "Rights under the agreement are personal to the hirer and are not assignable.",
  "Any indulgence or delay by owner does not waive the owner's rights.",
  "Notices are served in writing by hand delivery or registered post.",
  "Agreement is governed by the laws of Uganda.",
] as const;

const DECLARATIONS = [
  "I certify the information provided is true and complete.",
  "I accept the delay penalty terms as stated in the application form.",
  "I confirm I have inspected the vehicle and found it suitable.",
  "I consent to JeffLink processing this application for credit and contract evaluation.",
] as const;

const SECTIONS: readonly FormSection[] = [
  {
    title: "Applicant Information",
    description: "Core identity fields from the JeffLink application form.",
    fields: [
      { key: "applicationNo", label: "Application No." },
      { key: "applicationDate", label: "Date", type: "date" },
      { key: "firstName", label: "First Name" },
      { key: "middleName", label: "Middle Name" },
      { key: "lastName", label: "Last Name" },
      { key: "maidenName", label: "Maiden Name (if applicable)" },
      { key: "gender", label: "Gender", as: "select", options: GENDER_OPTIONS },
      { key: "civilStatus", label: "Civil Status", as: "select", options: CIVIL_STATUS_OPTIONS },
      { key: "birthDate", label: "Birth Date", type: "date" },
      { key: "age", label: "Age", type: "number" },
      { key: "birthPlace", label: "Birth Place" },
      { key: "nationality", label: "Nationality" },
      { key: "nationalId", label: "National ID No." },
      { key: "tin", label: "TIN" },
    ],
  },
  {
    title: "Contact and Employment",
    description: "Address, contact channels, and employer details.",
    fields: [
      { key: "homeAddress", label: "Home Address", as: "textarea", fullWidth: true },
      { key: "workAddress", label: "Work Address (include sketch direction)", as: "textarea", fullWidth: true },
      { key: "homePhone", label: "Home Tel No." },
      { key: "officePhone", label: "Office Tel No." },
      { key: "mobilePhone", label: "Mobile Phone" },
      { key: "email", label: "Email", type: "email" },
      { key: "employeeId", label: "Employee ID No." },
      { key: "employerName", label: "Company / Employer Name" },
      { key: "employerAddress", label: "Company / Employer Address", as: "textarea", fullWidth: true },
      { key: "homeOwnership", label: "Do you own or rent your home?", as: "select", options: HOME_OWNERSHIP_OPTIONS },
      { key: "durationAtAddress", label: "Duration at current address" },
    ],
  },
  {
    title: "Financial Status",
    description: "Banking and affordability details from the form.",
    fields: [
      { key: "bankName", label: "Bank" },
      { key: "accountName", label: "Name of Account" },
      { key: "accountNumber", label: "Account Number" },
      { key: "accountType", label: "Type of Account" },
      { key: "currency", label: "Currency" },
      { key: "monthlyNetIncome", label: "Monthly Net Income" },
      { key: "postdatedCheques", label: "Number of Postdated Cheques Issued", type: "number" },
      { key: "otherPayables", label: "Other Payable Items", as: "textarea", fullWidth: true, placeholder: "Trackers, insurance, arrangement fee..." },
    ],
  },
  {
    title: "Vehicle and Loan Details",
    description: "Vehicle request and hire purchase setup.",
    fields: [
      { key: "vehicleType", label: "Type of Vehicle", as: "select", options: VEHICLE_TYPE_OPTIONS },
      { key: "vehiclePurpose", label: "Purpose of Vehicle", as: "select", options: VEHICLE_PURPOSE_OPTIONS },
      { key: "paymentFrequency", label: "Preferred Payment", as: "select", options: PAYMENT_OPTIONS },
      { key: "periodTerm", label: "Period Term", as: "select", options: PERIOD_OPTIONS },
      { key: "hirePurchasePrice", label: "Hire Purchase Price" },
      { key: "downPaymentAmount", label: "Down Payment Amount" },
      { key: "cashPrice", label: "Cash Price" },
      { key: "make", label: "Make" },
      { key: "model", label: "Model" },
      { key: "bodyType", label: "Body Type" },
      { key: "bodyColor", label: "Body Color" },
      { key: "cylinders", label: "Cylinders" },
      { key: "engineNumber", label: "Engine Number" },
      { key: "engineSize", label: "Engine Size" },
      { key: "dateOfManufacture", label: "Date of Manufacture", type: "date" },
      { key: "chassisNumber", label: "Chassis Number" },
      { key: "keyType", label: "Type of Key", as: "select", options: KEY_TYPE_OPTIONS },
      { key: "insuranceProvider", label: "Insurance Provider" },
      { key: "insurancePolicyType", label: "Type of Insurance Policy" },
      { key: "currentLoan", label: "Current loan with any institution?", as: "select", options: LOAN_OPTIONS },
      { key: "loanDetails", label: "Current Loan Details", as: "textarea", fullWidth: true },
      { key: "driverPermitNumber", label: "Driver Permit License Number" },
      { key: "permitIssueDate", label: "Permit Issue Date", type: "date" },
      { key: "permitExpiryDate", label: "Permit Expiry Date", type: "date" },
    ],
  },
  {
    title: "Emergency and Signatories",
    description: "Next of kin, guarantor, and applicant sign-off fields.",
    fields: [
      { key: "emergencyContactName", label: "Emergency Contact / Next of Kin Name" },
      { key: "emergencyContactPhone", label: "Emergency Contact Phone" },
      { key: "emergencyContactAddress", label: "Emergency Contact Address", as: "textarea", fullWidth: true },
      { key: "guarantorName", label: "Guarantee (Name)" },
      { key: "nextOfKinName", label: "Next of Kin (Name)" },
      { key: "applicantSignatureName", label: "Applicant Signature (Typed Name)" },
    ],
  },
  {
    title: "Hire Purchase Schedule",
    description: "Schedule details mirrored from the hire purchase agreement.",
    fields: [
      { key: "scheduleMake", label: "Schedule: Make of Motor Vehicle" },
      { key: "scheduleYearOfManufacture", label: "Schedule: Year of Manufacture" },
      { key: "scheduleChassisNumber", label: "Schedule: Chassis Number" },
      { key: "scheduleRegistrationNumber", label: "Schedule: Registration Number" },
      { key: "scheduleInsuranceCompany", label: "Schedule: Insurance Company" },
      { key: "schedulePolicyExpiryDate", label: "Schedule: Policy Expiry Date", type: "date" },
    ],
  },
] as const;

const initialState: HirePurchaseFormState = {
  applicationNo: "",
  applicationDate: "",
  firstName: "",
  middleName: "",
  lastName: "",
  maidenName: "",
  gender: "",
  civilStatus: "",
  birthDate: "",
  age: "",
  birthPlace: "",
  nationality: "",
  nationalId: "",
  tin: "",
  homeAddress: "",
  workAddress: "",
  homePhone: "",
  officePhone: "",
  mobilePhone: "",
  email: "",
  employeeId: "",
  employerName: "",
  employerAddress: "",
  homeOwnership: "",
  durationAtAddress: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  accountType: "",
  currency: "UGX",
  monthlyNetIncome: "",
  postdatedCheques: "",
  otherPayables: "",
  vehicleType: "",
  vehiclePurpose: "",
  paymentFrequency: "",
  hirePurchasePrice: "",
  downPaymentAmount: "",
  cashPrice: "",
  periodTerm: "",
  bodyType: "",
  bodyColor: "",
  cylinders: "",
  keyType: "",
  engineNumber: "",
  model: "",
  make: "",
  dateOfManufacture: "",
  chassisNumber: "",
  engineSize: "",
  insuranceProvider: "",
  insurancePolicyType: "",
  currentLoan: "",
  loanDetails: "",
  driverPermitNumber: "",
  permitIssueDate: "",
  permitExpiryDate: "",
  emergencyContactName: "",
  emergencyContactAddress: "",
  emergencyContactPhone: "",
  guarantorName: "",
  nextOfKinName: "",
  applicantSignatureName: "",
  scheduleMake: "",
  scheduleYearOfManufacture: "",
  scheduleChassisNumber: "",
  scheduleRegistrationNumber: "",
  scheduleInsuranceCompany: "",
  schedulePolicyExpiryDate: "",
};

export default function HirePurchaseForm() {
  const [form, setForm] = useState<HirePurchaseFormState>(initialState);
  const [declarations, setDeclarations] = useState<boolean[]>(
    DECLARATIONS.map(() => false),
  );
  const [acceptAgreement, setAcceptAgreement] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const applicationSummary = useMemo(() => {
    return [
      ["Applicant", [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ") || "Not set"],
      ["Mobile", form.mobilePhone || "Not set"],
      ["National ID", form.nationalId || "Not set"],
      ["Vehicle", [form.make, form.model].filter(Boolean).join(" ") || "Not set"],
      ["Term", form.periodTerm || "Not set"],
      ["Hire Purchase Price", form.hirePurchasePrice || "Not set"],
    ];
  }, [form]);

  const updateField = (field: keyof HirePurchaseFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDeclaration = (index: number) => {
    setDeclarations((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitted(false);

    const required: Array<keyof HirePurchaseFormState> = [
      "firstName",
      "lastName",
      "mobilePhone",
      "nationalId",
      "hirePurchasePrice",
      "periodTerm",
      "applicantSignatureName",
    ];
    const missing = required.filter((key) => !String(form[key]).trim());
    const allDeclarationsChecked = declarations.every(Boolean);

    if (missing.length > 0) {
      setError("Please complete all required applicant and financing fields before submission.");
      return;
    }

    if (!acceptAgreement || !allDeclarationsChecked) {
      setError("Please accept the agreement terms and all applicant declarations.");
      return;
    }

    setSubmitted(true);
  };

  const fieldClass =
    "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-brand-primary focus:outline-none";

  return (
    <main className="min-h-screen bg-background text-text">
      <section className="border-b border-border bg-surface/90 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">JeffLink Transfers (Uganda) Ltd</p>
          <h1 className="mt-3 text-3xl font-black text-text md:text-4xl">Hire Purchase Application and Agreement</h1>
          <p className="mt-3 max-w-3xl text-sm text-text-muted">
            Digital implementation of the JeffLink Application Form and Hire Purchase Agreement.
            Fill all required fields, review terms, and submit for internal approval.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-text-muted">
            <span className="rounded-full border border-border px-3 py-1">Office: +256 (0)394 825303</span>
            <span className="rounded-full border border-border px-3 py-1">Mobile: +256 (0)752 360036</span>
            <span className="rounded-full border border-border px-3 py-1">Email: jefflinkstransfersltd@gmail.com</span>
            <span className="rounded-full border border-border px-3 py-1">Website: www.jefflinks.com</span>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {SECTIONS.map((section) => (
              <article key={section.title} className="rounded-card border border-border bg-card p-5">
                <h2 className="text-lg font-bold text-text">{section.title}</h2>
                <p className="mt-1 text-sm text-text-muted">{section.description}</p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {section.fields.map((field) => {
                    const value = String(form[field.key] ?? "");
                    const containerClass = field.fullWidth ? "md:col-span-2" : "";
                    const as = field.as ?? "input";

                    return (
                      <label key={String(field.key)} className={`block ${containerClass}`}>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                          {field.label}
                        </span>

                        {as === "textarea" ? (
                          <textarea
                            value={value}
                            onChange={(event) => updateField(field.key, event.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                            className={fieldClass}
                          />
                        ) : as === "select" ? (
                          <select
                            value={value}
                            onChange={(event) => updateField(field.key, event.target.value)}
                            className={fieldClass}
                          >
                            <option value="">Select option</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type ?? "text"}
                            value={value}
                            onChange={(event) => updateField(field.key, event.target.value)}
                            placeholder={field.placeholder}
                            className={fieldClass}
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </article>
            ))}

            <article className="rounded-card border border-border bg-card p-5">
              <h2 className="text-lg font-bold text-text">Agreement Terms and Conditions</h2>
              <p className="mt-1 text-sm text-text-muted">
                These clauses are adapted from the JeffLink Hire Purchase Agreement.
              </p>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed text-text-muted">
                {AGREEMENT_TERMS.map((term, index) => (
                  <li key={term}>
                    <span className="mr-2 text-brand-accent">{String(index + 1).padStart(2, "0")}.</span>
                    {term}
                  </li>
                ))}
              </ol>

              <div className="mt-5 space-y-3 rounded-xl border border-border bg-surface/60 p-4">
                {DECLARATIONS.map((item, index) => (
                  <label key={item} className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={declarations[index]}
                      onChange={() => toggleDeclaration(index)}
                      className="mt-1 h-4 w-4 rounded border-border bg-transparent accent-[var(--color-accent)]"
                    />
                    <span className="text-sm text-text-muted">{item}</span>
                  </label>
                ))}

                <label className="flex cursor-pointer items-start gap-3 border-t border-border pt-3">
                  <input
                    type="checkbox"
                    checked={acceptAgreement}
                    onChange={(event) => setAcceptAgreement(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border bg-transparent accent-[var(--color-accent)]"
                  />
                  <span className="text-sm font-semibold text-text">
                    I have read and accept the JeffLink Hire Purchase Agreement and agree to be bound by Ugandan law.
                  </span>
                </label>
              </div>

              {error && (
                <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}

              {submitted && (
                <p className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300">
                  Application captured successfully. JeffLink operations can now review and verify documents.
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-button bg-brand-accent px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-brand-accent/90"
                >
                  Submit Application
                </button>
                <Link
                  href="/contact"
                  className="rounded-button border border-border bg-card px-5 py-3 text-sm font-semibold text-text transition-colors hover:border-brand-primary/60"
                >
                  Contact JeffLink Office
                </Link>
              </div>
            </article>
          </form>

          <aside className="h-fit rounded-card border border-border bg-card p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-text">Application Snapshot</h2>
            <p className="mt-1 text-sm text-text-muted">Live summary from your current entries.</p>
            <div className="mt-4 space-y-3 text-sm">
              {applicationSummary.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-surface/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
                  <p className="mt-1 font-semibold text-text">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-text-muted">
              Required attachments in physical processing still include signed postdated cheques,
              deposit slip, and supporting verification documents.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
