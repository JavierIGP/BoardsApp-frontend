export class Layout {

    constructor(id = '', name = '', grid= {}, categories= []){
        this.id = id;
        this.name = name;
        this.grid = grid;
        this. categories = categories;
    }

    id: string;
    name: string;
    grid: object;
    categories: object;

}
