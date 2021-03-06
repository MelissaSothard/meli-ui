import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import { EmptyList } from '../../../commons/components/EmptyList';
import { Loader } from '../../../commons/components/Loader';
import { AlertError } from '../../../commons/components/AlertError';
import { useEnv } from '../../../providers/EnvProvider';
import { Token } from './token';
import { axios } from '../../../providers/axios';
import { AddToken } from './AddToken';
import { TokenView } from './TokenView';
import styles from './TokenList.module.scss';
import { TokenIcon } from '../../icons/TokenIcon';
import { useMountedState } from '../../../commons/hooks/use-mounted-state';

function sortTokens(a: Token, b: Token): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function TokenList() {
  const env = useEnv();
  const { siteId } = useParams();
  const [loading, setLoading] = useMountedState(true);
  const [error, setError] = useState();
  const [items, setItems] = useState<Token[]>();

  useEffect(() => {
    setLoading(true);
    setError(undefined);
    axios.get(`${env.MELI_API_URL}/api/v1/sites/${siteId}/tokens`)
      .then(({ data }) => data)
      .then(setItems)
      .catch(setError)
      .catch(err => toast(`Could not list tokens: ${err}`, {
        type: 'error',
      }))
      .finally(() => setLoading(false));
  }, [env, siteId, setLoading]);

  const onAdd = token => {
    setItems([token, ...items].sort(sortTokens));
  };

  const onDelete = (tokenId: string) => {
    setItems(items.filter(({ _id }) => _id !== tokenId));
  };

  const emptyList = (
    <EmptyList
      icon={<TokenIcon />}
      title="No tokens"
    >
      <p>There are no tokens yet</p>
      <AddToken siteId={siteId} onAdded={onAdd}>
        <button type="button" className="btn btn-primary">
          Add token
        </button>
      </AddToken>
    </EmptyList>
  );

  return loading ? (
    <Loader />
  ) : error ? (
    <AlertError error={error} />
  ) : (
    <>
      {items.length === 0 ? (
        emptyList
      ) : (
        <ul className="list-group">
          <AddToken
            siteId={siteId}
            onAdded={onAdd}
            className={classNames('list-group-item list-group-item-action', styles.add)}
          >
            Add token
          </AddToken>
          {items.map(token => (
            <TokenView
              key={token._id}
              siteId={siteId}
              token={token}
              onDelete={() => onDelete(token._id)}
            />
          ))}
        </ul>
      )}
    </>
  );
}
