// Section heading used across the homepage.
const SectionHeading = ({ eyebrow, title, intro, align = "left", action }) => (
    <div className={`mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${align === "center" ? "md:flex-col md:items-center text-center" : ""}`}>
        <div className={align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}>
            {eyebrow && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#A17B35]">{eyebrow}</p>
            )}
            <h2 className="text-2xl font-bold leading-tight text-[#072342] md:text-[2rem]">{title}</h2>
            {intro && <p className="mt-3 text-base leading-relaxed text-gray-600">{intro}</p>}
        </div>
        {action}
    </div>
);

export default SectionHeading;
