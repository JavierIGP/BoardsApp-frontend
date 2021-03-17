export interface Board {
    name: string;
    users: Array<string>;
    wsId: string;
    layout: string;
    data: {
        cards: Record<string, object>,
        sections: Record<string, Array<string>>
    };
}
