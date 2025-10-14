import express, { NextFunction, Request, Response, Router } from 'express';
import { Http, IServiceComplete, IServiceProvider, toHttpEnum } from '../service/DambaService';
import { ErrorMessage } from '../../../../common/error/error';
import { AppConfig } from '../../config/app';

const _routes = express.Router();
export const DambaRoute = (_SPS_: IServiceProvider<Request, Response, NextFunction>): Router => {

    for (const _ks in _SPS_) {
        // tODO: remove this log
        console.log(_ks);
        const _isc = _SPS_[_ks as keyof typeof _SPS_] as IServiceComplete<Request, Response, NextFunction>;
        const _ = _isc.service;
        const _mw = _isc.middleware;
        const _r = express.Router();
        for (const _k in _) {
            if (Object.prototype.hasOwnProperty.call(_, _k)) {
                const _v = _[_k as keyof typeof _];
                if (!_v) continue;
                const setExtras = (req: Request, res: Response, next: NextFunction) => {
                    const _vkeys = Object.keys(_v?.extras ?? {});
                    const _rkeys = Object.keys(req?.extras ?? {});
                    const _eKey = (_vkeys.length > 0 && _rkeys.length > 0) ? _vkeys.every(key => key in _rkeys) : false;
                    if (_eKey) {
                        const _sKeys = _vkeys.filter(key => !(key in _rkeys));
                        return res.status(500).send({
                            error: ErrorMessage.SAME_EXTRA_NAME,
                            duplicateKeys: _sKeys
                        })
                    }
                    req.extras = { ...req.extras, ..._v?.extras };
                    next();
                }
                const _frs = _k.toString().split("@");
                _v.method = toHttpEnum(_frs[0])!
                const _path = _frs[1];
                // tODO: remove this log
                console.log(_v.method, ":", AppConfig.base_path + _ks + _path)
                switch (_v?.method) {
                    case Http.GET:
                        !_v?.middleware ? _r.get(_path, setExtras, _v.behavior) : _r.get(_path, [..._v.middleware, setExtras], _v.behavior)
                        break;
                    case Http.POST:
                        !_v?.middleware ? _r.post(_path, setExtras, _v.behavior) : _r.get(_path, [..._v.middleware, setExtras], _v.behavior)
                        break;
                    case Http.DELETE:
                        !_v?.middleware ? _r.delete(_path, setExtras, _v.behavior) : _r.delete(_path, [..._v.middleware, setExtras], _v.behavior)
                        break;
                    case Http.PUT:
                        !_v?.middleware ? _r.put(_path, setExtras, _v.behavior) : _r.put(_path, [..._v.middleware, setExtras], _v.behavior)
                        break;
                }
            }

        }
        (_mw && _mw.length > 0) ? _routes.use(_ks, _mw, _r) : _routes.use(_ks, _r);
    }

    return _routes;
}

