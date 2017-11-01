import styled from 'styled-components';

export const Layout = styled.div`
    width: 100%;
    height: 100%;

    display: flex;
    flex-flow: column nowrap;

    overflow: hidden;

    .users-list {
        flex: 1;
        overflow-y: auto;
    }
`;