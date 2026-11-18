import { AmbassadorDirectory } from "@/components/AmbassadorDirectory";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAmbassadors } from "@/lib/content";

/** The campus ambassadors directory. Applications are closed, so the page shows the ambassadors only. */
export async function CampusAmbassador() {
  const ambassadors = await getAmbassadors();
  return (
    <section className="bg-white pt-32 pb-20 sm:pt-36 sm:pb-24">
      <Container>
        <FadeIn>
          <Breadcrumbs current="Campus Ambassadors" />
          <SectionHeading
            eyebrow="The faces of CYE on campus"
            title="Meet our Campus Ambassadors"
            description="Have a question about CYE 2026 at your institute? WhatsApp your head ambassador, or find your campus team below."
          />
        </FadeIn>
        <div className="mt-10">
          <AmbassadorDirectory groups={ambassadors} />
        </div>
      </Container>
    </section>
  );
}
