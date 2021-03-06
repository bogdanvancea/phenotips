/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
package edu.toronto.cs.phenotips.hpoa.utils.maps;

public class CounterMap<K> extends IntegerMap<K>
{
    private static final long serialVersionUID = 201202091730L;

    public CounterMap()
    {
        super();
    }

    public CounterMap(int initialCapacity)
    {
        super(initialCapacity);
    }

    public Integer addTo(K key)
    {
        Integer value = this.get(key);
        if (value == null) {
            return this.put(key, 1);
        } else {
            return this.put(key, value + 1);
        }
    }
}
