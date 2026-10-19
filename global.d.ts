interface ResumeMetaItem {
    html: string;
}

interface ResumeEntry {
    title: string;
    meta: ResumeMetaItem[];
    content: string;
}

interface ResumeGroup {
    title: string;
    meta: ResumeMetaItem[];
    entries: ResumeEntry[];
}

interface ResumeRichTextSection {
    key: string;
    title: string;
    kind: "rich-text";
    html: string;
}

interface ResumeGroupedEntriesSection {
    key: string;
    title: string;
    kind: "grouped-entries";
    groups: ResumeGroup[];
}

interface ResumeEntryListSection {
    key: string;
    title: string;
    kind: "entries";
    entries: ResumeEntry[];
}

type ResumeSection = ResumeRichTextSection | ResumeGroupedEntriesSection | ResumeEntryListSection;

interface ResumeData {
    information: Information;
    sections: ResumeSection[];
    lastUpdated: string;
}

interface Information {
    name: string;
    nickname: string;
    job: string;
    experience: string;
    specialty: string;
    location: string;
    gender: string;
    DOB: string;
    education: string;
    education_desc: string;
    college: string;
    major: string;
    phone: string;
    email: string;
    blog: string;
    github: string;
}

declare module "*.md?raw" {
    const content: string;
    export default content;
}