import TemplateSim from '@/simulations/_template/TemplateSim';

interface SimPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SimPage({ params }: SimPageProps) {
  const { slug } = await params;

  // TODO: Load simulation component from registry by slug
  // For now, render the template for testing
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-suttro-surface p-4">
      <div className="w-full max-w-4xl">
        <TemplateSim />
      </div>
      <p className="mt-4 text-sm text-suttro-muted">
        সিমুলেশন: {slug}
      </p>
    </div>
  );
}
