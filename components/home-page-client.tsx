"use client";

import { BarChart3, CalendarClock, Map, MessagesSquare, Mic2, Trophy } from "lucide-react";
import { CoursePreviewCard } from "@/components/course-preview-card";
import { FeatureCard } from "@/components/feature-card";
import { HomeHero } from "@/components/home-hero";
import { HomeStepCard } from "@/components/home-step-card";
import { SectionHeading } from "@/components/section-heading";
import { TestimonialCard } from "@/components/testimonial-card";
import { coursePreviewCards, featureCards, howItWorksSteps, testimonials } from "@/lib/app-data";

const stepIcons = [BarChart3, CalendarClock, Mic2] as const;
const featureIcons = [Mic2, BarChart3, Map, Trophy, CalendarClock, MessagesSquare] as const;

export function HomePageClient() {
  return (
    <>
      <HomeHero />

      <section id="how-it-works" className="section-shell space-y-10">
        <SectionHeading
          eyebrow="How It Works"
          title="Kaise Kaam Karta Hai?"
          subtitle="Simple. Structured. Spoken."
          description="Shuruaat se confidence tak har step guided hai, isliye learner ko agla kaam sochna nahi padta."
          align="center"
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {howItWorksSteps.map((step, index) => {
            const Icon = stepIcons[index];

            return (
              <HomeStepCard
                key={step.id}
                stepNumber={step.stepNumber}
                title={step.title}
                subtitle={step.hindiSubtitle}
                description={step.description}
                icon={Icon}
                delay={index * 0.08}
              />
            );
          })}
        </div>
      </section>

      <section className="section-shell space-y-10">
        <SectionHeading
          eyebrow="Success Stories"
          title="Unki Kahani"
          subtitle="Real learners, real results"
          description="Lucknow, Patna, aur Bhopal jaise shahron se learners ne isi structure ke saath apni spoken English badli."
          align="center"
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.name} {...testimonial} delay={index * 0.08} />
          ))}
        </div>
      </section>

      <section className="section-shell space-y-10">
        <SectionHeading
          eyebrow="Platform Features"
          title="Kya Milega Tumhe?"
          subtitle="Everything you need to go fluent"
          description="Bolo English ko aise design kiya gaya hai ki learner ko alag-alag apps ya random YouTube hopping ki zaroorat hi na pade."
          align="center"
        />
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature, index) => {
            const Icon = featureIcons[index];

            return <FeatureCard key={feature.id} title={feature.title} subtitle={feature.hindiSubtitle} description={feature.description} icon={Icon} delay={index * 0.05} />;
          })}
        </div>
      </section>

      <section className="section-shell space-y-10">
        <SectionHeading
          eyebrow="Course Preview"
          title="Level-wise Lessons"
          subtitle="Har stage ke liye ready-made speaking paths"
          description="Existing learning paths ko redesign karke action-first cards mein rakha gaya hai, taaki learner seedha practice shuru kar sake."
        />
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {coursePreviewCards.map((course, index) => (
            <CoursePreviewCard
              key={course.id}
              level={course.level}
              title={course.title}
              subtitle={course.hindiSubtitle}
              duration={course.duration}
              description={course.description}
              href={course.href}
              delay={index * 0.06}
            />
          ))}
        </div>
      </section>
    </>
  );
}