import { useMemo, useState, type ReactNode } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import Checkbox from "../../components/ui/Checkbox";
import Button from "../../components/ui/Button";

type FieldType = "default" | "numeric" | "email" | "date";

type InputField = {
  key: keyof HirePurchaseFormState;
  label: string;
  placeholder?: string;
  full?: boolean;
  multiline?: boolean;
  type?: FieldType;
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
  accountName: string;
  monthlyNetIncome: string;
  accountType: string;
  currency: string;
  postdatedCheques: string;
  bankName: string;
  accountNumber: string;
  otherPayables: string;
  emergencyName: string;
  emergencyAddress: string;
  emergencyPhone: string;
  vehicleType: string;
  vehiclePurpose: string;
  paymentFrequency: string;
  hirePurchasePrice: string;
  downPaymentAmount: string;
  cashPrice: string;
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
  periodTerm: string;
  insuranceProvider: string;
  insurancePolicyType: string;
  hasCurrentLoan: string;
  loanDetails: string;
  driverPermitNumber: string;
  permitIssueDate: string;
  permitExpiryDate: string;
  guarantorName: string;
  nextOfKinName: string;
  applicantSignatureName: string;
  scheduleMake: string;
  scheduleYear: string;
  scheduleChassis: string;
  scheduleRegNo: string;
  scheduleInsuranceCompany: string;
  schedulePolicyExpiry: string;
};

const GENDER_OPTIONS = ["Male", "Female"];
const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Widow/er", "Annulled", "Legally Separated"];
const OWNERSHIP_OPTIONS = ["Own", "Rent"];
const VEHICLE_TYPE_OPTIONS = ["New", "Used"];
const VEHICLE_PURPOSE_OPTIONS = ["Personal Use", "Business"];
const PAYMENT_OPTIONS = ["Weekly", "Monthly"];
const PERIOD_OPTIONS = ["1 Year", "2 Years", "2.5 Years", "3 Years", "4 Years", "5 Years"];
const KEY_TYPE_OPTIONS = ["Remote", "No-Remote"];
const LOAN_OPTIONS = ["No", "Yes"];

const AGREEMENT_TERMS = [
  "The hirer pays agreed rent and initial deposit to the owner's nominated account.",
  "Postdated cheques are issued as security of the vehicle.",
  "The vehicle cannot be sold, transferred, or taken out of Uganda without written consent.",
  "The hirer keeps the vehicle in good repair and permits owner inspection.",
  "Road tax, licensing fees, and applicable duties are borne by the hirer.",
  "Comprehensive insurance in owner and hirer names must remain active.",
  "The vehicle must carry a tracking device and the hirer ensures functionality.",
  "Mechanical service and maintenance remain the hirer's responsibility.",
  "Default or breach may allow repossession and recovery actions by the owner.",
  "Ownership transfers only after full settlement of hire purchase obligations.",
  "Agreement rights are personal to the hirer and are not assignable to third parties.",
  "Agreement is subject to the laws of Uganda.",
] as const;

const DECLARATIONS = [
  "I confirm all information provided is true and correct.",
  "I understand delay penalties apply to unpaid monthly amortization.",
  "I confirm I have inspected the vehicle and accept its condition.",
  "I authorize JeffLink to process this application for contract and credit review.",
] as const;

const PERSONAL_FIELDS: InputField[] = [
  { key: "applicationNo", label: "Application No." },
  { key: "applicationDate", label: "Date (DD/MM/YYYY)", type: "date" },
  { key: "firstName", label: "First Name" },
  { key: "middleName", label: "Middle Name" },
  { key: "lastName", label: "Last Name" },
  { key: "maidenName", label: "Maiden Name" },
  { key: "birthDate", label: "Birth Date (DD/MM/YYYY)", type: "date" },
  { key: "age", label: "Age", type: "numeric" },
  { key: "birthPlace", label: "Birth Place" },
  { key: "nationality", label: "Nationality" },
  { key: "nationalId", label: "National ID No." },
  { key: "tin", label: "TIN" },
];

const CONTACT_FIELDS: InputField[] = [
  { key: "homeAddress", label: "Home Address", multiline: true, full: true },
  { key: "workAddress", label: "Work Address (attach sketch map)", multiline: true, full: true },
  { key: "homePhone", label: "Home Tel No." },
  { key: "officePhone", label: "Office Tel No." },
  { key: "mobilePhone", label: "Mobile Phone" },
  { key: "email", label: "Email", type: "email" },
  { key: "employeeId", label: "Employee ID No." },
  { key: "employerName", label: "Company/Employer Name" },
  { key: "employerAddress", label: "Company/Employer Address", multiline: true, full: true },
  { key: "durationAtAddress", label: "Duration at Current Address" },
];

const FINANCIAL_FIELDS: InputField[] = [
  { key: "bankName", label: "Bank" },
  { key: "accountName", label: "Name of Account" },
  { key: "accountNumber", label: "Account Number" },
  { key: "accountType", label: "Type of Account" },
  { key: "currency", label: "Currency" },
  { key: "monthlyNetIncome", label: "Monthly Net Income" },
  { key: "postdatedCheques", label: "Number of Postdated Cheques", type: "numeric" },
  { key: "otherPayables", label: "Other Payable Items", multiline: true, full: true },
];

const VEHICLE_FIELDS: InputField[] = [
  { key: "hirePurchasePrice", label: "Hire Purchase Price" },
  { key: "downPaymentAmount", label: "Down Payment Amount" },
  { key: "cashPrice", label: "Cash Price" },
  { key: "bodyType", label: "Body Type" },
  { key: "bodyColor", label: "Body Color" },
  { key: "cylinders", label: "Cylinders", type: "numeric" },
  { key: "engineNumber", label: "Engine Number" },
  { key: "model", label: "Model" },
  { key: "make", label: "Make" },
  { key: "dateOfManufacture", label: "Date of Manufacture" },
  { key: "chassisNumber", label: "Chassis Number" },
  { key: "engineSize", label: "Engine Size" },
  { key: "insuranceProvider", label: "Insurance Arranged With" },
  { key: "insurancePolicyType", label: "Insurance Policy Type" },
  { key: "loanDetails", label: "Current Loan Details", multiline: true, full: true },
  { key: "driverPermitNumber", label: "Driver Permit Number" },
  { key: "permitIssueDate", label: "Permit Issue Date" },
  { key: "permitExpiryDate", label: "Permit Expiry Date" },
];

const EMERGENCY_FIELDS: InputField[] = [
  { key: "emergencyName", label: "Emergency Contact / Next of Kin Name" },
  { key: "emergencyPhone", label: "Emergency Contact Phone" },
  { key: "emergencyAddress", label: "Emergency Contact Address", multiline: true, full: true },
  { key: "guarantorName", label: "Guarantee Name" },
  { key: "nextOfKinName", label: "Next of Kin Name" },
  { key: "applicantSignatureName", label: "Applicant Signature (Typed Name)" },
];

const SCHEDULE_FIELDS: InputField[] = [
  { key: "scheduleMake", label: "Schedule: Make of Motor Vehicle" },
  { key: "scheduleYear", label: "Schedule: Year of Manufacture" },
  { key: "scheduleChassis", label: "Schedule: Chassis Number" },
  { key: "scheduleRegNo", label: "Schedule: Reg No." },
  { key: "scheduleInsuranceCompany", label: "Schedule: Insurance Company" },
  { key: "schedulePolicyExpiry", label: "Schedule: Expiry Date of Policy" },
];

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
  accountName: "",
  monthlyNetIncome: "",
  accountType: "",
  currency: "UGX",
  postdatedCheques: "",
  bankName: "",
  accountNumber: "",
  otherPayables: "",
  emergencyName: "",
  emergencyAddress: "",
  emergencyPhone: "",
  vehicleType: "",
  vehiclePurpose: "",
  paymentFrequency: "",
  hirePurchasePrice: "",
  downPaymentAmount: "",
  cashPrice: "",
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
  periodTerm: "",
  insuranceProvider: "",
  insurancePolicyType: "",
  hasCurrentLoan: "",
  loanDetails: "",
  driverPermitNumber: "",
  permitIssueDate: "",
  permitExpiryDate: "",
  guarantorName: "",
  nextOfKinName: "",
  applicantSignatureName: "",
  scheduleMake: "",
  scheduleYear: "",
  scheduleChassis: "",
  scheduleRegNo: "",
  scheduleInsuranceCompany: "",
  schedulePolicyExpiry: "",
};

function keyboardTypeFor(fieldType: FieldType | undefined) {
  if (fieldType === "numeric") return "number-pad" as const;
  if (fieldType === "email") return "email-address" as const;
  return "default" as const;
}

export default function HirePurchaseApplicationScreen() {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState<HirePurchaseFormState>(initialState);
  const [declarations, setDeclarations] = useState<boolean[]>(DECLARATIONS.map(() => false));
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const summary = useMemo(
    () => [
      ["Applicant", [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ") || "Not set"],
      ["Mobile", form.mobilePhone || "Not set"],
      ["National ID", form.nationalId || "Not set"],
      ["Vehicle", [form.make, form.model].filter(Boolean).join(" ") || "Not set"],
      ["Term", form.periodTerm || "Not set"],
      ["Hire Price", form.hirePurchasePrice || "Not set"],
    ],
    [form],
  );

  const updateField = (key: keyof HirePurchaseFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDeclaration = (index: number) => {
    setDeclarations((prev) => prev.map((entry, idx) => (idx === index ? !entry : entry)));
  };

  const navigateBackToTabs = () => {
    const parent = navigation.getParent?.();
    if (parent?.navigate) {
      parent.navigate("CustomerTabs");
      return;
    }
    navigation.navigate("CustomerTabs");
  };

  const handleSubmit = () => {
    const required: Array<keyof HirePurchaseFormState> = [
      "firstName",
      "lastName",
      "mobilePhone",
      "nationalId",
      "hirePurchasePrice",
      "periodTerm",
      "applicantSignatureName",
    ];
    const missing = required.filter((field) => !String(form[field]).trim());

    if (missing.length) {
      Alert.alert("Incomplete Application", "Please fill all required applicant and financing fields.");
      return;
    }

    if (!declarations.every(Boolean) || !agreementAccepted) {
      Alert.alert("Required Consent", "Please accept all declarations and agreement terms before submitting.");
      return;
    }

    Alert.alert(
      "Application Submitted",
      "Your hire purchase application has been captured and is ready for JeffLink review.",
    );
  };

  return (
    <AppChrome
      title="Hire Purchase"
      activeKey="finance"
      variant="customer"
      showBottomNav={false}
    >
      <ScrollView contentContainerClassName="gap-5 px-6 pt-6 pb-12">
        <Header
          title="Hire Purchase Application"
          subtitle="Digital form based on JeffLink application and agreement documents"
        />

        <View className="rounded-2xl border border-brand-slate bg-brand-night p-4">
          <Text className="text-xs uppercase tracking-[1.4px] text-brand-accent">
            JeffLink Transfers (Uganda) Ltd
          </Text>
          <Text className="mt-2 text-sm text-brand-muted">
            Office: +256(0)394825303 | Mobile: +256(0)752360036
          </Text>
          <Text className="text-sm text-brand-muted">
            Email: jefflinkstransfersltd@gmail.com | Website: www.jefflinks.com
          </Text>
          <Pressable
            onPress={navigateBackToTabs}
            className="mt-3 self-start rounded-full border border-brand-slate px-3 py-1.5"
          >
            <Text className="text-xs font-semibold text-white">Back to dashboard</Text>
          </Pressable>
        </View>

        <FormSection title="Applicant Information" subtitle="Personal identity fields">
          <OptionChips
            label="Gender"
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={(value) => updateField("gender", value)}
          />
          <OptionChips
            label="Civil Status"
            options={CIVIL_STATUS_OPTIONS}
            value={form.civilStatus}
            onChange={(value) => updateField("civilStatus", value)}
          />
          <RenderFields fields={PERSONAL_FIELDS} form={form} updateField={updateField} />
        </FormSection>

        <FormSection title="Contact and Employment" subtitle="Address and work profile">
          <OptionChips
            label="Home Ownership"
            options={OWNERSHIP_OPTIONS}
            value={form.homeOwnership}
            onChange={(value) => updateField("homeOwnership", value)}
          />
          <RenderFields fields={CONTACT_FIELDS} form={form} updateField={updateField} />
        </FormSection>

        <FormSection title="Financial Status" subtitle="Bank and affordability details">
          <RenderFields fields={FINANCIAL_FIELDS} form={form} updateField={updateField} />
        </FormSection>

        <FormSection title="Vehicle and Loan Details" subtitle="Requested vehicle and financing details">
          <OptionChips
            label="Type of Vehicle"
            options={VEHICLE_TYPE_OPTIONS}
            value={form.vehicleType}
            onChange={(value) => updateField("vehicleType", value)}
          />
          <OptionChips
            label="Purpose of Vehicle"
            options={VEHICLE_PURPOSE_OPTIONS}
            value={form.vehiclePurpose}
            onChange={(value) => updateField("vehiclePurpose", value)}
          />
          <OptionChips
            label="Preferred Payment"
            options={PAYMENT_OPTIONS}
            value={form.paymentFrequency}
            onChange={(value) => updateField("paymentFrequency", value)}
          />
          <OptionChips
            label="Period Term"
            options={PERIOD_OPTIONS}
            value={form.periodTerm}
            onChange={(value) => updateField("periodTerm", value)}
          />
          <OptionChips
            label="Type of Key"
            options={KEY_TYPE_OPTIONS}
            value={form.keyType}
            onChange={(value) => updateField("keyType", value)}
          />
          <OptionChips
            label="Current Loan"
            options={LOAN_OPTIONS}
            value={form.hasCurrentLoan}
            onChange={(value) => updateField("hasCurrentLoan", value)}
          />
          <RenderFields fields={VEHICLE_FIELDS} form={form} updateField={updateField} />
        </FormSection>

        <FormSection title="Emergency Contacts and Signatories" subtitle="Next of kin and guarantee entries">
          <RenderFields fields={EMERGENCY_FIELDS} form={form} updateField={updateField} />
        </FormSection>

        <FormSection title="Agreement Schedule" subtitle="Schedule from hire purchase agreement">
          <RenderFields fields={SCHEDULE_FIELDS} form={form} updateField={updateField} />
        </FormSection>

        <FormSection title="Agreement Terms" subtitle="Summary of core terms and conditions">
          <View className="rounded-2xl border border-brand-slate bg-brand-dark/50 p-4">
            {AGREEMENT_TERMS.map((term, index) => (
              <Text key={term} className="mb-2 text-sm leading-5 text-brand-muted">
                {index + 1}. {term}
              </Text>
            ))}
          </View>

          <View className="gap-3">
            {DECLARATIONS.map((label, index) => (
              <Checkbox
                key={label}
                checked={declarations[index]}
                label={label}
                onToggle={() => toggleDeclaration(index)}
              />
            ))}
            <Checkbox
              checked={agreementAccepted}
              label="I accept the JeffLink hire purchase agreement and Ugandan law jurisdiction."
              onToggle={() => setAgreementAccepted((prev) => !prev)}
            />
          </View>
        </FormSection>

        <View className="rounded-2xl border border-brand-slate bg-brand-night p-4">
          <Text className="text-base font-semibold text-white">Application Snapshot</Text>
          <View className="mt-3 gap-2">
            {summary.map(([label, value]) => (
              <View
                key={label}
                className="flex-row items-center justify-between rounded-xl border border-brand-slate bg-brand-dark/50 px-3 py-2"
              >
                <Text className="text-xs text-brand-muted">{label}</Text>
                <Text className="text-xs font-semibold text-white">{value}</Text>
              </View>
            ))}
          </View>
          <Text className="mt-3 text-xs text-brand-muted">
            Document checklist verification (postdated cheques, deposit slip, guarantor documents) remains required in the internal review stage.
          </Text>
        </View>

        <Button label="Submit Hire Purchase Application" onPress={handleSubmit} />
      </ScrollView>
    </AppChrome>
  );
}

function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3 rounded-2xl border border-brand-slate bg-brand-night p-4">
      <Text className="text-lg font-semibold text-white">{title}</Text>
      <Text className="-mt-1 text-sm text-brand-muted">{subtitle}</Text>
      <View className="gap-3">{children}</View>
    </View>
  );
}

function OptionChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-xs uppercase tracking-[1px] text-brand-muted">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              className={[
                "rounded-full border px-3 py-1.5",
                selected
                  ? "border-brand-accent bg-brand-accent/20"
                  : "border-brand-slate bg-brand-dark/40",
              ].join(" ")}
            >
              <Text className={selected ? "text-xs font-semibold text-brand-accent" : "text-xs text-brand-muted"}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function RenderFields({
  fields,
  form,
  updateField,
}: {
  fields: InputField[];
  form: HirePurchaseFormState;
  updateField: (key: keyof HirePurchaseFormState, value: string) => void;
}) {
  return (
      <View className="flex-row flex-wrap justify-between gap-y-3">
      {fields.map((field) => (
        <View key={String(field.key)} className={field.full ? "w-full gap-1.5" : "w-[48%] gap-1.5"}>
          <Text className="text-xs uppercase tracking-[1px] text-brand-muted">{field.label}</Text>
          <TextInput
            value={String(form[field.key] ?? "")}
            onChangeText={(value) => updateField(field.key, value)}
            placeholder={field.placeholder}
            placeholderTextColor="#94A3B8"
            keyboardType={keyboardTypeFor(field.type)}
            multiline={field.multiline}
            className={[
              "rounded-xl border border-brand-slate bg-brand-dark/40 px-3 py-3 text-sm text-white",
              field.multiline ? "min-h-[84px]" : "",
            ].join(" ")}
          />
        </View>
      ))}
    </View>
  );
}
