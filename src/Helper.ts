export default class Helper {

    public static print(state: number): void {
        let out = state.toString(2);
        this.write(`0000${out}`.slice(out.length));
    }

    public static write(text: Object): void {
        document.body.innerHTML += `<p>${JSON.stringify(text)}</p>`;
    }
}