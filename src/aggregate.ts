export type InterestResponse = {
  name: string;
  section: string;
  rsvp: number;
};

export type SectionResponse = {
  section: string;
  affirmatives: number;
  maybes: number;
  negatives: number;
};

export function groupBySection(rsvps: Array<InterestResponse>): Array<SectionResponse> {
  function initSection(section: string): SectionResponse { 
    return {
      section: section,
      affirmatives: 0, 
      maybes: 0, 
      negatives: 0,
    }
  };
  const responseBySection = new Map<string,SectionResponse>();
  rsvps.forEach(rsvp => {
    const entry = responseBySection.get(rsvp.section) || initSection(rsvp.section);
    if (rsvp.rsvp > 0) {
      entry.affirmatives += 1;
    } else if (rsvp.rsvp < 0) {
      entry.negatives += 1;
    } else {
      entry.maybes += 1;
    }
    responseBySection.set(rsvp.section, entry);
  });
  return Array.from(responseBySection.entries()).map(kv => {
    return {
      section: kv[0],
      affirmatives: kv[1].affirmatives,
      maybes: kv[1].maybes,
      negatives: kv[1].negatives,
    }
  });
}

