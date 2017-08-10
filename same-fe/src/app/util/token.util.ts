import { JwtHelper } from 'angular2-jwt';


export class TokenUtil {

    private jwtHelper: JwtHelper = new JwtHelper();

    public getUser(token: string) {
        if (token == null) {
            return null;
        }
        try {
            let decoded = this.jwtHelper.decodeToken(token);
            return decoded;
        } catch(e) {
            console.log('error decoding security token ' + e);
            return null;
        }
    }

}
