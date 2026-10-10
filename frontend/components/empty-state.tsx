/** No filing found: say so plainly, with the likely explanations. */
export function EmptyState() {
  return (
    <div className="max-w-[34em]">
      <p className="text-sm leading-5 font-medium text-ink">
        No Form D on file for this company.
      </p>
      <p className="mt-1 text-[13px] leading-5 text-graphite">
        It may raise under a different exemption or a different legal name.
      </p>
    </div>
  );
}
