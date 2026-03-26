import type { Metadata } from "next";
import { VocabularyBrowser } from "@/components/vocabulary-browser";

export const metadata: Metadata = {
  title: "English Vocabulary - Hindi Meaning ke saath | Bolo English",
  description: "1000+ English words Hindi meaning, pronunciation, aur use cases ke saath. Memory tips jo words hamesha yaad rahe."
};

export default function VocabularyPage() {
  return <VocabularyBrowser />;
}
