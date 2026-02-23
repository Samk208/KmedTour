import { CheckCircle2, Info } from 'lucide-react'

const CITY_WHY: Record<string, string> = {
  Seoul: 'Seoul is South Korea\'s medical capital, home to the highest concentration of KAHF-certified hospitals in Asia. The city has invested over $2 billion in healthcare infrastructure, with clinics in the Gangnam and Sinchon districts leading the world in minimally invasive techniques and patient outcomes.',
  Busan: 'Busan combines coastal recovery with world-class medical care. Its internationally accredited clinics attract patients from across Africa and the Middle East, offering a quieter, resort-style environment for post-procedure recovery while maintaining Korean quality standards.',
  Incheon: 'Incheon is home to South Korea\'s largest international airport and a rapidly growing medical hub. Clinics here specialize in short-stay procedures ideal for international patients, with many offering integrated travel-to-treatment packages and multilingual coordinators.',
  Daegu: 'Daegu has emerged as a leading center for specialized procedures, particularly in dermatology, dental care, and orthopedics. Costs here average 15-20% below Seoul\'s rates while maintaining equivalent accreditation and safety standards.',
}

interface TechSpecsProps {
    city: string
    treatmentTitle: string
    priceRange: string
    duration?: string
    recoveryTime?: string
}

export function PseoTechSpecs({ city, treatmentTitle, priceRange, duration, recoveryTime }: TechSpecsProps) {
    const whyCity = CITY_WHY[city] ??
        `${city} is a premier destination for ${treatmentTitle} in Korea, offering internationally accredited facilities, multilingual coordinators, and transparent pricing. Korean hospitals in this region maintain strict KAHF/KOIHA safety standards for international patients.`

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-[var(--kmed-navy)] flex items-center gap-2">
                        <Info className="h-5 w-5 text-[var(--kmed-blue)]" aria-hidden="true" />
                        Procedure Overview
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg bg-[var(--soft-grey)] p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Procedure</p>
                            <p className="font-semibold text-[var(--kmed-navy)]">{treatmentTitle}</p>
                        </div>
                        <div className="rounded-lg bg-[var(--soft-grey)] p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Est. Price Range</p>
                            <p className="font-semibold text-[var(--kmed-navy)]">{priceRange || 'Request a quote'}</p>
                        </div>
                        {duration && (
                            <div className="rounded-lg bg-[var(--soft-grey)] p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Est. Duration</p>
                                <p className="font-semibold text-[var(--kmed-navy)]">{duration}</p>
                            </div>
                        )}
                        {recoveryTime && (
                            <div className="rounded-lg bg-[var(--soft-grey)] p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Recovery Time</p>
                                <p className="font-semibold text-[var(--kmed-navy)]">{recoveryTime}</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-[var(--kmed-navy)] mb-2">Why {city}?</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{whyCity}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-xl bg-[var(--kmed-navy)] p-6 text-white shadow-lg">
                    <h3 className="mb-4 font-bold text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-[var(--kmed-teal)]" aria-hidden="true" />
                        The KmedTour Guarantee
                    </h3>
                    <ul className="space-y-3 text-sm text-white/90" role="list">
                        {[
                            'Direct access to KAHF & KOIHA verified surgeons',
                            'No hidden fees — transparent procedure costs',
                            'Full medical visa & travel support',
                            'Dedicated coordinator throughout your journey',
                            'Post-op follow-up care coordination',
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--kmed-teal)]" aria-hidden="true" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
