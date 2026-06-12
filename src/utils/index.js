import { formatDistanceToNow, format, isValid } from "date-fns";

export function formatDate(ts) {
  if (!ts) return "—";
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  if (!isValid(date)) return "—";
  return format(date, "dd MMM yyyy");
}

export function formatRelative(ts) {
  if (!ts) return "—";
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  if (!isValid(date)) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatSalary(salary) {
  if (!salary) return "Salary not specified";
  const { min, max, currency = "NGN", negotiable } = salary;
  const sym = currency === "NGN" ? "₦" : currency + " ";
  if (!min && !max) return negotiable ? "Negotiable" : "Not specified";
  const fmt = (n) => sym + Number(n).toLocaleString("en-NG");
  if (min && max) return `${fmt(min)} – ${fmt(max)} / month`;
  if (min) return `From ${fmt(min)} / month`;
  if (max) return `Up to ${fmt(max)} / month`;
  return negotiable ? "Negotiable" : "Not specified";
}

export const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nassarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"
];

export const SCHOOL_TYPES = [
  "Government Primary","Government Secondary","Private Primary","Private Secondary",
  "Federal University","State University","Polytechnic","College of Education"
];

export const SUBJECTS = [
  "Mathematics","English Language","Physics","Chemistry","Biology","Further Mathematics",
  "Economics","Commerce","Accounting","Geography","History","Government","Literature",
  "Yoruba","Igbo","Hausa","French","Arabic","Computer Science","Agricultural Science",
  "Home Economics","Food & Nutrition","Fine Arts","Music","Physical Education","Civic Education",
  "Basic Science","Basic Technology","Business Studies","Social Studies","CRS/IRS"
];
