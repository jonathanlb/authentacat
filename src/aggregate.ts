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

export function groupBy<T>(xs: Array<T>, key: string): Map<string, Array<T>> {
  const key2groups = new Map<string,Array<any>>();
  xs.forEach(x => {
    const k = (x as any)[key];
    if (key2groups.has(k)) {
      key2groups.get(k)?.push(x);
    } else {
      key2groups.set(k, [x]);
    }
  })
  return key2groups;
}

export function tallyBySection(rsvps: Array<InterestResponse>): Array<SectionResponse> {
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

