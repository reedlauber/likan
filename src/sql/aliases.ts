function assignClauseAlias(alias: string, clause: string) {
  const [left, right] = clause.split('=');
  let leftWithAlias = left;

  if(!/[a-z]?\.[a-z]?/i.test(left)) {
    leftWithAlias = `${alias}.${left}`;
  }

  return `${leftWithAlias}=${right}`;
}

function assignAlias(wheres: string[], alias?: string) {
  if (!alias) {
    return wheres;
  }

  return wheres.map((where: string) => {
    const matches = where.match(/[\.a-z_)]+ = \?/ig);
    let aliasedWhere = where;

    if (matches) {
      matches.forEach((match) => {
        if (match.indexOf('.') === -1) {
          aliasedWhere = aliasedWhere.replace(match, assignClauseAlias(alias, match));
        }
      });
    }

    return aliasedWhere;
  });
}

export { assignAlias };
