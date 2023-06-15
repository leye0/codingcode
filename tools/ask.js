export async function ask(readLineInterface, question, prepopulate) {
    return new Promise(resolve => {
        readLineInterface.question(question, input => resolve(input));
        if (prepopulate) {
            readLineInterface.write(prepopulate);
        }
    });
}