import type { Metadata } from "next";
import HirePurchaseForm from "./HirePurchaseForm";

export const metadata: Metadata = {
  title: "Hire Purchase Application",
  description:
    "Complete the JeffLink hire purchase application and review agreement terms online.",
};

export default function HirePurchasePage() {
  return <HirePurchaseForm />;
}
