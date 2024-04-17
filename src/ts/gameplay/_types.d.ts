type Dialog = [
    text: string,
    choice?: Choice,
];

type Choice = [
    title: string,
    options: ChoiceOption[],
];

type ChoiceOption = [
    text: string,
    handler: () => void,
];