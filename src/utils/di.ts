import { Container, interfaces } from 'inversify';
import { makeFluentProvideDecorator } from 'inversify-binding-decorators';
import getDecorators from 'inversify-inject-decorators';

const container = new Container();
const provide = makeFluentProvideDecorator(container);

type Identifier<T> = string | interfaces.Newable<T> | interfaces.Abstract<T>;

export const bind = <T>(identifier: Identifier<T>, target: T) => {
  container.bind(identifier).toConstantValue(target);
};

export const injectable = <T>(identifier: Identifier<T>) => {
  return provide(identifier).done();
};

export const singleton = <T>(identifier: Identifier<T>) => {
  return provide(identifier).inSingletonScope().done();
};

export const inject = getDecorators(container).lazyInject;
