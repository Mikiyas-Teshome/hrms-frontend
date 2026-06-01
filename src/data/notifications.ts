export interface Notification {
    id: string;
    title: string;
    body: string;
    time: string;
    read: boolean;
}

export const SAMPLE_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Meeting Tomorrow',
        body: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.",
        time: '20h ago',
        read: false,
    },
    {
        id: '2',
        title: 'Re: Project Update',
        body: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done a fantastic job, and I appreciate the hard work everyone has put in.",
        time: '21h ago',
        read: true,
    },
    {
        id: '3',
        title: 'Weekend Plans',
        body: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we had some outdoor fun. If you're interested, let me know, and we can plan the details.",
        time: '20h ago',
        read: false,
    },
    {
        id: '4',
        title: 'Re: Question about Budget',
        body: "I have a question about the budget for the upcoming project. It seems like there's a discrepancy in the allocation of resources. I've reviewed the budget report and identified a few areas where we might be able to optimize.",
        time: '20h ago',
        read: false,
    },
    {
        id: '5',
        title: 'Important Announcement',
        body: "I have an important announcement to make during our team meeting. It pertains to a strategic shift in our approach to the upcoming product launch. We've received valuable feedback from our beta testers.",
        time: '20h ago',
        read: false,
    },
];
