import type { SectionRow } from "@/lib/pages";
import Block, { Figure } from "@/components/pages/Blocks";

// Lays out one section of a ported page. Standalone blocks keep their existing
// full-width rhythm, and a photograph that has prose next to it becomes a
// two-column row on large screens, which is the density the home page uses.
// Below that breakpoint the grid collapses to one column and the pair stacks in
// the order Karen wrote it, so nothing about the reading order changes on a
// phone.
export default function SectionRows({ rows }: { rows: SectionRow[] }) {
  return (
    <>
      {rows.map((row, i) => {
        if (row.kind === "block") return <Block key={i} block={row.block} />;

        const image = (
          <Figure
            block={row.image}
            reveal={row.flip ? "fade-left" : "fade-right"}
          />
        );
        const prose = (
          <div className="flex flex-col gap-5">
            {row.side.map((block, j) => (
              <Block key={j} block={block} />
            ))}
          </div>
        );

        return (
          <div
            key={i}
            className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
          >
            {row.flip ? prose : image}
            {row.flip ? image : prose}
          </div>
        );
      })}
    </>
  );
}
