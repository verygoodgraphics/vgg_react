import * as React from 'react';
import VGGLoader from '../../../';

export default class IndexPage extends React.Component {
  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    // this.refs.vggLoader.loadWork('hello', '/hello.vgg');
  }

  render() {
    return (
      <div style={{ backgroundColor: 'black' }}>
        <VGGLoader
          ref={'vggLoader'}
          token={'ckxuj3g5l00089cp5ipekbdw2'}
          width={800}
          height={500}
        />
      </div>
    );
  }
}
